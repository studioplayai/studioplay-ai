
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ToolMode, CampaignSettings, MoodSettings, TemplateBuilderSettings, TOOLS_CATEGORIES, TEXT_LAYOUTS, MarketingIdeas, TOOL_PRESETS } from "../types";
import { getV7Prompt } from "./v7PromptMap";


// Helper to convert Base64 to raw data for the SDK
const stripBase64Header = (base64: string) => base64.split(',')[1];
const getMimeType = (base64: string) => base64.substring(base64.indexOf(':') + 1, base64.indexOf(';'));

// 🔧 Downscale base64 image to improve speed & focus on main subject
async function downscaleBase64Image(
  base64: string,
  maxSize = 1024,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64;
  });
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error.status || error.code || (error.response ? error.response.status : null);
    const isOverloaded = status === 503 || status === 429 || (error.message && error.message.includes('overloaded')) || (error.message && error.message.includes('503'));
    
    if (retries === 0 || !isOverloaded) {
      if (isOverloaded) {
        throw new Error("SERVER_OVERLOADED");
      }
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * backoff, backoff);
  }
}

export const enhanceUserPrompt = async (simplePrompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({ apiKey });

    const modelName = 'gemini-3-flash-preview';
    const prompt = `Rewrite user request into detailed professional prompt: "${simplePrompt}"`;
    try {
        const response: GenerateContentResponse = await retryWithBackoff(() => ai.models.generateContent({
            model: modelName,
            contents: { parts: [{ text: prompt }] },
        }));
        return response.text?.trim() || simplePrompt;
    } catch (e) { return simplePrompt; }
};

export const generateMarketingIdeas = async (
  niche: string,
  userContext: string,
  language: string
): Promise<MarketingIdeas> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log(
  '[DEBUG API KEY]',
  apiKey ? apiKey.slice(0, 6) + '...' + apiKey.slice(-4) : '❌ MISSING'
);

const ai = new GoogleGenAI({ apiKey });

  const modelName = 'gemini-3-flash-preview';

  const systemInstruction = `You are a high-end Social Media Strategist and Creative Director.
Analyze the niche (${niche}) and the product/brand context provided: "${userContext}".
Provide a massive brainstorming output in ${language}.

JSON Structure Required:
{
  "posts": ["10 specific viral post ideas with headlines and visual hooks"],
  "stories": ["5 interactive story ideas (polls, Q&A, BTS)"],
  "videos": ["5 reels/tiktok concepts with scene descriptions and music vibes"],
  "trends": ["3-5 current trends or aesthetic shifts in this specific niche"],
  "campaign": "One big, out-of-the-box campaign idea or sale event concept"
}`;

  try {
    const response: GenerateContentResponse = await retryWithBackoff(() => ai.models.generateContent({
      model: modelName,
      contents: "Brainstorm marketing ideas.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            posts: { type: Type.ARRAY, items: { type: Type.STRING } },
            stories: { type: Type.ARRAY, items: { type: Type.STRING } },
            videos: { type: Type.ARRAY, items: { type: Type.STRING } },
            trends: { type: Type.ARRAY, items: { type: Type.STRING } },
            campaign: { type: Type.STRING }
          },
          required: ["posts", "stories", "videos", "trends", "campaign"]
        }
      }
    }));

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Marketing ideas generation failed:", e);
    throw e;
  }
};

export const chatWithAiAssistant = async (
    history: { role: 'user' | 'model'; content: string }[],
    userMessage: string,
    currentTool: ToolMode
): Promise<{ text: string; recommendedToolId?: ToolMode }> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({ apiKey });

    const modelName = 'gemini-3-flash-preview';

    const systemInstruction = `You are a helpful AI assistant for StudioPlay AI. Use tool: ${currentTool}.`;
    const contents = history.map(h => ({ role: h.role, parts: [{ text: h.content }] }));

    try {
        const response: GenerateContentResponse = await retryWithBackoff(() => ai.models.generateContent({
            model: modelName,
            contents,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        recommendedToolId: { type: Type.STRING }
                    },
                    required: ["text"]
                }
            }
        }));

        const json = JSON.parse(response.text || '{}');
        return { text: json.text || "I'm here to help!", recommendedToolId: json.recommendedToolId as ToolMode | undefined };
    } catch (e) { return { text: "I'm sorry, I'm having trouble responding." }; }
};

export const generateStrategicMarketingPlan = async (
    userContext: string,
    niche: string,
    language: string,
    selectedStyleId?: string | null
): Promise<{
    imagePrompt: string;
    variations: { title: string, subtitle: string, footer: string }[];
    layoutStyle: string;
    titlePos: { x: number, y: number };
    pricePos: { x: number, y: number };
    discountPos: { x: number, y: number };
}> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({ apiKey });

    const modelName = 'gemini-3-flash-preview';

    const systemInstruction = `You are a Creative Director for a LUXURY brand. 
Generate exactly 3 variations of marketing copy (title, subtitle, footer) for niche: ${niche}. Context: ${userContext}.
Styles must be: Variation 1 (Minimalist/Clean), Variation 2 (Luxury/Gold/Poetic), Variation 3 (Bold/Call to Action).
Language: ${language}.
Also suggest coordinates (0-100) for placement.`;

    try {
        const response: GenerateContentResponse = await retryWithBackoff(() => ai.models.generateContent({
            model: modelName,
            contents: "Plan 3 luxury variations.",
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        imagePrompt: { type: Type.STRING },
                        variations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    subtitle: { type: Type.STRING },
                                    footer: { type: Type.STRING }
                                },
                                required: ["title", "subtitle", "footer"]
                            }
                        },
                        layoutStyle: { type: Type.STRING },
                        titlePos: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                        pricePos: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } },
                        discountPos: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
                    },
                    required: ["imagePrompt", "variations", "layoutStyle", "titlePos", "pricePos", "discountPos"]
                }
            }
        }));

        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error("Strategic plan failed:", e);
        throw e;
    }
};

export const processImageWithGemini = async (
  base64Image: string,
  mode: ToolMode,
  customPrompt?: string,
  selectedOptionId?: string | null,
  campaignSettings?: CampaignSettings,
  moodSettings?: MoodSettings,
  collageImages?: string[], 
  templateSettings?: TemplateBuilderSettings,
  enableDeepThinking?: boolean
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const v7Prompt = getV7Prompt(mode, {
  customPrompt,
  selectedOptionId: selectedOptionId ?? "",
  style: "",
});


if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({ apiKey });


 // ⚡ SPEED + STYLE FIX: downscale image before sending to Gemini
const optimizedImage = await downscaleBase64Image(base64Image, 768, 0.78);

const mimeType =
  optimizedImage.startsWith('data:image/png') ? 'image/png' :
  optimizedImage.startsWith('data:image/webp') ? 'image/webp' :
  optimizedImage.startsWith('data:image/jpeg') ? 'image/jpeg' :
  'image/png'; // fallback בטוח

const imageBytes = stripBase64Header(optimizedImage);



  let modelName = 'gemini-2.5-flash-image'; 
  const config: any = { imageConfig: { aspectRatio: '1:1' } };
  
  if (enableDeepThinking && (mode === ToolMode.RECOLOR || mode === ToolMode.MOCKUP_GENERATOR)) {
    modelName = 'gemini-3-pro-image-preview';
    config.thinkingConfig = { thinkingBudget: 4000 };
  }
// ✅ SOCIAL_POST = 2-step: (1) enhance image, (2) generate matching post
if (mode === ToolMode.SOCIAL_POST) {
  // --- Step 1: Enhance image (fast) ---
  const imagePrompt = [
  customPrompt?.trim() ? `User context: ${customPrompt.trim()}` : "",
  "Act as a professional studio retoucher and lighting expert.",
  "Enhance the provided image into a high-end commercial asset.",
  "Composition: Do NOT crop or move the subject. Keep framing identical.",
  "Lighting: Apply premium studio lighting (soft shadows, rim light, depth).",
  "Colors: Grade the colors to look expensive, vibrant yet realistic.",
  "Vibe: Professional, clean, and ready for a premium social feed.",
  "Strict Rule: No text, no logos, no watermarks inside the image.",
  "Output: Only the enhanced image."
].filter(Boolean).join("\n");

  const imageParts: any[] = [
    { text: imagePrompt },
    { inlineData: { mimeType, data: imageBytes } }
  ];

 const imageResp = await retryWithBackoff(() =>
  ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { text: v7Prompt || imagePrompt },
        { inlineData: { mimeType, data: imageBytes } },
      ],
    },
    config: {
      imageConfig: { aspectRatio: "1:1" },
    },
  })
);


  let enhancedDataUrl: string | null = null;
  for (const part of imageResp.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.data) {
      enhancedDataUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
      break;
    }
  }
  if (!enhancedDataUrl) throw new Error("Failed to enhance image");

  // --- Step 2: Generate post (fast text JSON) ---
  const postPrompt = [
    "You are a senior social media copywriter.",
    "Create 3 short Hebrew posts that match the enhanced image.",
    "Constraints: punchy, concrete benefits, max 2 emojis, clear CTA, 2-6 hashtags.",
    "Return ONLY valid JSON in this format:",
    "{",
    '  "version1": {"hook": "...", "body": "...", "cta": "...", "hashtags": ["...","..."]},',
    '  "version2": {"hook": "...", "body": "...", "cta": "...", "hashtags": ["...","..."]},',
    '  "version3": {"hook": "...", "body": "...", "cta": "...", "hashtags": ["...","..."]}',
    "}"
  ].join("\n");

  const postResp: any = await retryWithBackoff(() =>
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { text: postPrompt },
          { inlineData: { mimeType: "image/png", data: enhancedDataUrl.split(",")[1] } }
        ]
      },
      config: { responseMimeType: "application/json" }
    })
  );

  const postJsonText =
    postResp.text ||
    postResp.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text ||
    "{}";

  // מחזירים תוצאה משולבת (תמונה + פוסט)
  let postData: any = {};
try {
  postData = JSON.parse(postJsonText);
} catch {
  postData = {};
}

return JSON.stringify({
  enhancedImage: enhancedDataUrl,
  post: postData
});

}

  const raw = (customPrompt || "").trim();

// Extract STYLE line if exists: "STYLE: ...."
const styleMatch = raw.match(/STYLE:\s*(.+)/i);
const styleHint = styleMatch?.[1]?.trim() || "Auto/Default";

// Extract USER REQUEST line if exists
const reqMatch = raw.match(/USER REQUEST:\s*([\s\S]*)/i);
const userRequest = reqMatch?.[1]?.trim() || raw;


const prompt = [
  "You are an expert product/social creative retoucher.",
  `STYLE TO APPLY: ${styleHint}`,
  "",
  "GOAL:",
  "- Improve the uploaded image quality and apply the selected STYLE using color grading, lighting, and background mood.",
  "- The result MUST clearly match the selected STYLE.",
  "",
  "SUBJECT LOCK (VERY IMPORTANT):",
  "- Preserve the MAIN SUBJECT identity and proportions, but allow STYLE transformation (lighting, materials, reflections, surface finish, background mood) according to the selected STYLE.",
  "- Keep the same composition and framing (no cropping, no moving the subject).",
  "- The main subject must remain the central focus; do NOT ignore it.",
  "",
  "ALLOWED CHANGES:",
  "- Sharpen subtly, reduce noise/artifacts, improve lighting/contrast/clarity, refine background mood to match the STYLE.",
  "",
  "STRICT RULES:",
  "- Do NOT add new objects.",
  "- Do NOT remove the main subject.",
  "- Do NOT add any text, letters, logos, or watermarks inside the image.",
  "- Output IMAGE only.",
  "",
  "USER REQUEST (apply only if it does NOT violate SUBJECT LOCK):",
  userRequest ? `- ${userRequest}` : ""
].filter(Boolean).join("\n");



  try {
    const parts: any[] = [{ text: prompt }, { inlineData: { mimeType, data: imageBytes } }];
    if (collageImages) {
        collageImages.forEach(img => parts.push({ inlineData: { mimeType: getMimeType(img), data: stripBase64Header(img) } }));
    }

    const response = await ai.models.generateContent({ model: modelName, contents: { parts }, config });

    console.log("🧠 GEMINI RESPONSE OBJECT:", response);
    console.log("🧠 CANDIDATES:", response?.candidates);

    for (const part of response.candidates?.[0]?.content?.parts || []) {
  console.log("🔍 GEMINI PART:", part);

  if (part.inlineData) {
    console.log("✅ INLINE IMAGE RETURNED");
    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
  }

  if (part.text) {
    console.log("⚠️ TEXT RETURNED:", part.text);
  }
}

    throw new Error("Failed to generate image data");
  } catch (error) { throw error; }
};