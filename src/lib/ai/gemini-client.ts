import { GoogleGenerativeAI } from "@google/generative-ai";

export const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL ??
  process.env.NEXT_PUBLIC_GEMINI_MODEL ??
  "gemini-3.5-flash";

export interface GeminiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GeminiCallOptions {
  model?: string;
  system?: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface GeminiResponse {
  content: string;
  model: string;
}

function resolveApiKey(): string | undefined {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  return process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}

export function isGeminiConfigured(): boolean {
  return Boolean(resolveApiKey());
}

export async function callGemini(options: GeminiCallOptions): Promise<GeminiResponse> {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const modelName = options.model ?? DEFAULT_GEMINI_MODEL;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: options.system,
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      maxOutputTokens: options.maxTokens ?? 1024,
      ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  });

  const result = await model.generateContent(options.user);
  const content = result.response.text();

  return {
    content,
    model: modelName,
  };
}

export async function callGeminiWithMessages(
  messages: GeminiMessage[],
  options?: Omit<GeminiCallOptions, "system" | "user"> & { system?: string },
): Promise<GeminiResponse> {
  const system = options?.system ?? messages.find((m) => m.role === "system")?.content;
  const conversation = messages.filter((m) => m.role !== "system");
  const user = conversation
    .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
    .join("\n\n");

  return callGemini({
    system,
    user,
    model: options?.model,
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
    jsonMode: options?.jsonMode,
  });
}
