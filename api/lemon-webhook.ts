import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

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

function timingSafeEqual(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function verifySignature(rawBody: Buffer, secret: string, signatureHeader?: string) {
  if (!signatureHeader) return false;
  const sig = signatureHeader.startsWith("sha256=") ? signatureHeader.slice(7) : signatureHeader;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(digest, sig);
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
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

export default async function handler(req: VercelRequest, res: VercelResponse) {if (req.method !== "POST") {
  return res.status(200).send("Lemon webhook endpoint (POST only)");
}

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return res.status(500).send("Missing LEMONSQUEEZY_WEBHOOK_SECRET");

  const rawBody = await readRawBody(req);
  const signature = req.headers["x-signature"] as string | undefined;

  if (!verifySignature(rawBody, secret, signature)) {
    return res.status(401).send("Invalid signature");
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).send("Invalid JSON");
  }

  const eventName =
    payload?.meta?.event_name ||
    payload?.event_name ||
    payload?.name ||
    "unknown";

  const allowed = new Set(["order_created", "subscription_created", "subscription_payment_success"]);
  if (!allowed.has(eventName)) {
    return res.status(200).json({ ok: true, ignored: eventName });
  }

  const variantName =
    payload?.data?.attributes?.variant_name ||
    payload?.data?.attributes?.first_order_item?.variant_name ||
    payload?.data?.attributes?.order_items?.[0]?.variant_name ||
    "";

  const planInfo = creditsFromVariantName(variantName);
  if (!planInfo) {
    console.log("Webhook: unknown variant name:", variantName);
    return res.status(400).json({ ok: false, error: "Unknown variant", variantName });
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
    return res.status(400).json({ ok: false, error: "Missing user_id/email" });
  }

  console.log("LEMON EVENT:", eventName, "variant:", variantName, "add:", planInfo.credits, "userId:", userId, "email:", email);

  const filter = userId
    ? `id=eq.${encodeURIComponent(userId)}`
    : `email=eq.${encodeURIComponent(email)}`;

  const get = await supabaseRequest(`/rest/v1/profiles?select=id,email,credits,plan&${filter}`, "GET");
  if (!get.ok || !Array.isArray(get.json) || get.json.length === 0) {
    return res.status(404).json({ ok: false, error: "User not found in profiles", by: userId ? "id" : "email" });
  }

  const profile = get.json[0];
  const currentCredits = Number(profile.credits || 0);
  const newCredits = currentCredits + planInfo.credits;

  const patch = await supabaseRequest(`/rest/v1/profiles?${filter}`, "PATCH", {
    credits: newCredits,
    plan: planInfo.planKey,
  });

  if (!patch.ok) {
    return res.status(500).json({ ok: false, error: "Failed updating credits", details: patch.text });
  }

  return res.status(200).json({
    ok: true,
    eventName,
    variantName,
    added: planInfo.credits,
    before: currentCredits,
    after: newCredits,
    user: { id: profile.id, email: profile.email },
  });
}
