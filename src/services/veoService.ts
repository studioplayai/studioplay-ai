
// @google/genai
import { GoogleGenAI } from "@google/genai";
import { ReelsVideoSettings } from "../types";

const stripBase64Header = (base64: string) => base64.split(',')[1];
const getMimeType = (base64: string) => base64.substring(base64.indexOf(':') + 1, base64.indexOf(';'));

export const generateVideoFromImage = async (
    base64Image: string,
    settings: ReelsVideoSettings,
    onProgress?: (status: string, percentage: number) => void
): Promise<string> => {
    // Create a new instance with the latest API key right before the call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const styleMap: Record<string, string> = {
        'zoom_in': 'a smooth, cinematic zoom-in effect on the main subject',
        'zoom_out': 'a smooth zoom-out effect revealing more of the environment',
        'pan': 'a gentle, slow pan across the image from left to right',
        'orbit': 'a slow orbital camera movement around the central product',
        'fpv_drone': 'an aggressive, fast-paced FPV drone shot flying dynamically around the object',
        'dolly_zoom': 'a "Hitchcock" dolly zoom effect where the background perspective shifts dramatically',
        'flicker_neon': 'pulsating neon lights creating a vibrant cyberpunk atmosphere',
        'golden_hour': 'beautiful golden hour sunbeams slowly moving across the scene',
        'smoke_reveal': 'swirling smoke slowly revealing the product from the darkness',
        'water_reflect': 'the product sitting above a body of water with moving ripples',
        'falling_petals': 'soft flower petals gently falling around the subject',
        'vhs': 'a retro 90s home video style with slight static noise',
        'cyberpunk_glitch': 'digital glitch artifacts with chromatic aberration shifting',
    };

    const motionDescription = styleMap[settings.style] || 'a dynamic motion effect';

    let prompt = `Create a short, 5-second video from the provided still image.
    The video should feature ${motionDescription}.
    It should be high-quality and engaging for social media.`;

    if (settings.caption) {
        prompt += `\nInclude animated text overlay: "${settings.caption}"`;
    }

    const imageBytes = stripBase64Header(base64Image);
    const mimeType = getMimeType(base64Image);

    try {
        if (onProgress) onProgress('INITIALIZING', 5);
        
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: imageBytes,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: settings.aspectRatio,
            }
        });

        let pollCount = 0;
        // Guidelines recommend 10s polling for video operations
        while (!operation.done) {
            pollCount++;
            const simulatedPercent = Math.min(10 + (pollCount * 5), 95);
            
            if (onProgress) {
                const message = pollCount < 4 ? 'ANALYZING' : 
                                pollCount < 10 ? 'MOTION_PLANNING' : 
                                pollCount < 20 ? 'RENDERING' : 'FINALIZING';
                onProgress(message, simulatedPercent);
            }

            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (operation.error) {
            const errorObj = operation.error as any;
            if (typeof errorObj?.message === 'string' && errorObj.message.includes("Requested entity was not found.")) {
                throw new Error("API_KEY_REQUIRED");
            }
            throw new Error(`Video generation failed: ${errorObj?.message}`);
        }

        if (onProgress) onProgress('DOWNLOADING', 98);

        const downloadLink = (operation.response as any)?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) throw new Error('Download link missing from API response');

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) throw new Error("Failed to download video file from server");
        
        // Use globalThis.Blob to avoid potential shadowing issues with @google/genai Blob
        const videoBlob: globalThis.Blob = await videoResponse.blob();
        
        if (onProgress) onProgress('COMPLETED', 100);
        
        return window.URL.createObjectURL(videoBlob);
    } catch (error: any) {
        console.error("Veo Service Error:", error);
        throw error;
    }
};
