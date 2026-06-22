import { callLlm } from "@/lib/ai/llm-provider";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";import { isOpenRouterConfigured } from "@/lib/ai/openrouter-client";
import { buildClassificationPrompt } from "@/lib/ai/prompts/classification";
import { buildExtractionPrompt } from "@/lib/ai/prompts/extraction";
import { buildNormalizationPrompt } from "@/lib/ai/prompts/normalization";
import { buildCombinedUploadPrompt } from "@/lib/ai/prompts/combined-upload";
import {
  combinedUploadResponseSchema,
  classificationResponseSchema,
  extractionResponseSchema,
  normalizationResponseSchema,
  parseJsonResponse,
} from "@/lib/ai/response-parser";

const SYSTEM_PROMPT =
  "Harvest AI: extract food-service operational data. Respond with valid JSON only.";

export function isAiConfigured(): boolean {
  return isGeminiConfigured() || isOpenRouterConfigured();
}

async function callAiLlm(options: {
  system: string;
  user: string;
  maxTokens?: number;
  jsonMode?: boolean;
}) {
  const { content, model, provider } = await callLlm({
    system: options.system,
    user: options.user,
    maxTokens: options.maxTokens,
    jsonMode: options.jsonMode ?? true,
  });
  return { content, model, provider };
}

export async function classifyWithAi(input: {
  fileName: string;
  fileType: string;
  description?: string;
  contentPreview: string;
}) {
  const response = await callAiLlm({
    system: SYSTEM_PROMPT,
    user: buildClassificationPrompt(input),
    maxTokens: 256,
  });

  return parseJsonResponse(response.content, classificationResponseSchema);
}

export async function extractWithAi(input: { classification: string; content: string }) {
  const response = await callAiLlm({
    system: SYSTEM_PROMPT,
    user: buildExtractionPrompt(input),
    maxTokens: 1024,
  });

  return parseJsonResponse(response.content, extractionResponseSchema);
}

export async function classifyAndExtractWithAi(input: {
  fileName: string;
  fileType: string;
  description?: string;
  content: string;
}) {
  const response = await callAiLlm({
    system: SYSTEM_PROMPT,
    user: buildCombinedUploadPrompt(input),
    maxTokens: 1024,
  });

  return parseJsonResponse(response.content, combinedUploadResponseSchema);
}

export async function normalizeWithAi(input: {
  classification: string;
  entities: unknown[];
  unitSystem: string;
  memoryMappings: Array<{ source_term: string; canonical_term: string }>;
}) {
  const response = await callAiLlm({
    system: SYSTEM_PROMPT,
    user: buildNormalizationPrompt(input),
    maxTokens: 1024,
  });

  return parseJsonResponse(response.content, normalizationResponseSchema);
}

export async function ocrImageWithAi(base64Data: string, mimeType: string): Promise<string> {
  if (isGeminiConfigured()) {
    const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent([
      "Extract all text and tabular data. Return plain text only.",
      {
        inlineData: { data: base64Data, mimeType },
      },
    ]);
    return result.response.text();
  }

  const response = await callAiLlm({
    system: SYSTEM_PROMPT,
    user: `Extract text from image (${mimeType}). Return plain text only.`,
    maxTokens: 1024,
    jsonMode: false,
  });

  return response.content;
}

export { isGeminiConfigured, isOpenRouterConfigured };
