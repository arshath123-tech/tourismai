import { GoogleGenAI } from "@google/genai";

export interface AIResponseResult {
  text: string;
  isFallback: boolean;
  modelUsed: string;
  latencyMs: number;
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || process.env.API_KEY || "";
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.warn("[AIService] Failed to initialize GoogleGenAI with key:", err);
    return null;
  }
}

export class AIService {
  public static isAvailable(): boolean {
    const client = getAiClient();
    return client !== null;
  }

  public static async generateResponse(completedPrompt: string): Promise<AIResponseResult> {
    const startTime = Date.now();
    const ai = getAiClient();

    if (!ai) {
      console.warn("[AIService] No valid GEMINI_API_KEY found in process.env. Using fallback.");
      return {
        text: "",
        isFallback: true,
        modelUsed: "intelligent-fallback-engine",
        latencyMs: Date.now() - startTime
      };
    }

    const candidateModels = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: completedPrompt,
        });

        const text = response.text ? response.text.trim() : "";
        const latencyMs = Date.now() - startTime;

        if (text && text.length > 20) {
          return {
            text,
            isFallback: false,
            modelUsed: modelName,
            latencyMs
          };
        }
      } catch (err: any) {
        // Silently handle model level quota or model availability issues
      }
    }

    console.warn("[AIService] All Gemini models exhausted or quota limit hit. Switching to intelligent synthesis fallback engine.");
    return {
      text: "",
      isFallback: true,
      modelUsed: "intelligent-synthesis-fallback",
      latencyMs: Date.now() - startTime
    };
  }
}

// Export legacy helper function for backwards compatibility
export async function generateContentWithAi(prompt: string): Promise<string> {
  const result = await AIService.generateResponse(prompt);
  return result.text;
}

export function isAiAvailable(): boolean {
  return AIService.isAvailable();
}

