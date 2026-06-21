import { callOpenRouter, isOpenRouterConfigured } from "@/lib/ai/openrouter-client";
import {
  classificationResponseSchema,
  extractionResponseSchema,
  normalizationResponseSchema,
  parseJsonResponse,
} from "@/lib/ai/response-parser";
import { buildClassificationPrompt } from "@/lib/ai/prompts/classification";
import { buildExtractionPrompt } from "@/lib/ai/prompts/extraction";
import { buildNormalizationPrompt } from "@/lib/ai/prompts/normalization";

const SYSTEM_PROMPT =
  "You are Harvest AI, an expert at understanding food service operational documents. Always respond with valid JSON when requested. Never take autonomous actions.";

export async function classifyWithAi(input: {
  fileName: string;
  fileType: string;
  description?: string;
  contentPreview: string;
}) {
  const response = await callOpenRouter({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildClassificationPrompt(input) },
    ],
    responseFormat: "json_object",
  });

  return parseJsonResponse(response.content, classificationResponseSchema);
}

export async function extractWithAi(input: { classification: string; content: string }) {
  const response = await callOpenRouter({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildExtractionPrompt(input) },
    ],
    responseFormat: "json_object",
    maxTokens: 8192,
  });

  return parseJsonResponse(response.content, extractionResponseSchema);
}

export async function normalizeWithAi(input: {
  classification: string;
  entities: unknown[];
  unitSystem: string;
  memoryMappings: Array<{ source_term: string; canonical_term: string }>;
}) {
  const response = await callOpenRouter({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildNormalizationPrompt(input) },
    ],
    responseFormat: "json_object",
    maxTokens: 8192,
  });

  return parseJsonResponse(response.content, normalizationResponseSchema);
}

export async function ocrImageWithAi(base64Data: string, mimeType: string): Promise<string> {
  const response = await callOpenRouter({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all text and tabular data from this image. Return plain text only, preserving structure.",
          },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Data}` },
          },
        ],
      },
    ],
    maxTokens: 4096,
  });

  return response.content;
}

export { isOpenRouterConfigured };
