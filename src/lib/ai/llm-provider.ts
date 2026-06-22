import { callGemini, isGeminiConfigured } from "@/lib/ai/gemini-client";
import { callOpenRouter, isOpenRouterConfigured } from "@/lib/ai/openrouter-client";

export type LlmProvider = "gemini" | "openrouter";

export interface LlmCallOptions {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LlmCallResult {
  content: string;
  provider: LlmProvider;
  model: string;
}

export function resolveLlmProvider(): LlmProvider {
  if (isGeminiConfigured()) {
    return "gemini";
  }
  if (isOpenRouterConfigured()) {
    return "openrouter";
  }
  return "gemini";
}

export async function callLlm(options: LlmCallOptions): Promise<LlmCallResult> {
  const provider = resolveLlmProvider();

  if (provider === "gemini" && isGeminiConfigured()) {
    const response = await callGemini({
      system: options.system,
      user: options.user,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      jsonMode: options.jsonMode,
    });
    return {
      content: response.content,
      provider: "gemini",
      model: response.model,
    };
  }

  if (provider === "openrouter" && isOpenRouterConfigured()) {
    const response = await callOpenRouter({
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
      temperature: options.temperature ?? 0.2,
      maxTokens: options.maxTokens ?? 1024,
      responseFormat: options.jsonMode ? "json_object" : "text",
    });
    return {
      content: response.content,
      provider: "openrouter",
      model: response.model,
    };
  }

  throw new Error("No AI provider configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY.");
}
