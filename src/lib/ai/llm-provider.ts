import { isOpenRouterConfigured, callOpenRouter } from "@/lib/ai/openrouter-client";
import {
  LOCAL_LLM_MAX_TOKENS,
  LOCAL_LLM_TEMPERATURE,
} from "@/lib/ai/local/model-config";

export type LlmProvider = "local" | "openrouter";

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
  if (typeof window !== "undefined") {
    return "local";
  }
  if (isOpenRouterConfigured()) {
    return "openrouter";
  }
  return "local";
}

export async function callLlm(options: LlmCallOptions): Promise<LlmCallResult> {
  const provider = resolveLlmProvider();

  if (provider === "openrouter" && isOpenRouterConfigured()) {
    const response = await callOpenRouter({
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
      temperature: options.temperature ?? LOCAL_LLM_TEMPERATURE,
      maxTokens: options.maxTokens ?? LOCAL_LLM_MAX_TOKENS,
      responseFormat: options.jsonMode ? "json_object" : "text",
    });
    return {
      content: response.content,
      provider: "openrouter",
      model: response.model,
    };
  }

  const { getLocalLlmEngine } = await import("@/lib/ai/local/web-llm-engine");
  const engine = await getLocalLlmEngine();

  const response = await engine.chat.completions.create({
    messages: [
      { role: "system", content: options.system },
      { role: "user", content: options.user },
    ],
    temperature: options.temperature ?? LOCAL_LLM_TEMPERATURE,
    max_tokens: options.maxTokens ?? LOCAL_LLM_MAX_TOKENS,
    response_format: options.jsonMode ? { type: "json_object" } : undefined,
  });

  const content = response.choices[0]?.message?.content ?? "";

  return {
    content,
    provider: "local",
    model: response.model ?? "local-llm",
  };
}
