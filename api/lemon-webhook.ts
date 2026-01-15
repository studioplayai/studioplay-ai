// api/lemon-webhook.ts
import crypto from "crypto";

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function verifySignature(rawBody: Buffer, secret: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;

  // Some providers send "sha256=<hex>"
  const sig = signatureHeader.startsWith("sha256=") ? signatureHeader.slice(7) : signatureHeader;

  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(digest, sig);
}

const PLAN_CREDITS_MAP: Record<string, number> = {
  "basic plan": 35,
  "pro plan": 80,
  "pro max plan": 120,
};

function creditsFromVariantName(variantName: string) {
  const name = (variantName || "").toLowerCase();
  const key = Object.keys(PLAN_CREDITS_MAP).find((k) => name.includes(k));
  return key ? { planKey: key, credits: PLAN_CREDITS_MAP[key] } : null;
}

async function supabaseRequest(path: string, method: string, body?: any) {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(`${url}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=representation",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  return { ok: res.ok, status: res.status, json, text };
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return new Response("Missing LEMONSQUEEZY_WEBHOOK_SECRET", { status: 500 });

  const rawBody = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("x-signature");

  const isValid = verifySignature(rawBody, secret, signature);
  if (!isValid) return new Response("Invalid signature", { status: 401 });

  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventName =
    payload?.meta?.event_name ||
    payload?.event_name ||
    payload?.name ||
    "unknown";

  const allowed = new Set(["order_created", "subscription_created", "subscription_payment_success"]);
  if (!allowed.has(eventName)) {
    return new Response(JSON.stringify({ ok: true, ignored: eventName }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const variantName =
    payload?.data?.attributes?.variant_name ||
    payload?.data?.attributes?.first_order_item?.variant_name ||
    payload?.data?.attributes?.order_items?.[0]?.variant_name ||
    "";

  const planInfo = creditsFromVariantName(variantName);
  if (!planInfo) {
    console.log("Webhook: unknown variant name:", variantName);
    return new Response(JSON.stringify({ ok: false, error: "Unknown variant", variantName }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId =
    payload?.data?.attributes?.custom_data?.user_id ||
    payload?.data?.attributes?.checkout_data?.custom?.user_id ||
    payload?.meta?.custom_data?.user_id ||
    null;

  const email =
    payload?.data?.attributes?.user_email ||
    payload?.data?.attributes?.customer_email ||
    payload?.data?.attributes?.email ||
    null;

  if (!userId && !email) {
    return new Response(JSON.stringify({ ok: false, error: "Missing user_id/email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("LEMON EVENT:", eventName, "variant:", variantName, "add:", planInfo.credits, "userId:", userId, "email:", email);

  const filter = userId
    ? `id=eq.${encodeURIComponent(userId)}`
    : `email=eq.${encodeURIComponent(email)}`;

  const get = await supabaseRequest(`/rest/v1/profiles?select=id,email,credits,plan&${filter}`, "GET");
  if (!get.ok || !Array.isArray(get.json) || get.json.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: "User not found in profiles", by: userId ? "id" : "email" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const profile = get.json[0];
  const currentCredits = Number(profile.credits || 0);
  const newCredits = currentCredits + planInfo.credits;

  const patch = await supabaseRequest(`/rest/v1/profiles?${filter}`, "PATCH", {
    credits: newCredits,
    plan: planInfo.planKey,
  });

  if (!patch.ok) {
    return new Response(JSON.stringify({ ok: false, error: "Failed updating credits", details: patch.text }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      eventName,
      variantName,
      added: planInfo.credits,
      before: currentCredits,
      after: newCredits,
      user: { id: profile.id, email: profile.email },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
