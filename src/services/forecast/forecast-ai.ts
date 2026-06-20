import { callOpenRouter, isOpenRouterConfigured } from "@/lib/ai/openrouter-client";
import { parseJsonResponse } from "@/lib/ai/response-parser";
import { buildForecastReasoningPrompt } from "@/lib/ai/prompts/forecast-reasoning";
import {
  forecastReasoningSchema,
  type ForecastComputation,
  type OperationalSnapshot,
} from "@/services/intelligence/intelligence-types";

const AI_TIMEOUT_MS = 3000;

export async function enrichForecastWithAi(
  computation: ForecastComputation,
  snapshot: OperationalSnapshot,
): Promise<ForecastComputation> {
  if (!isOpenRouterConfigured()) {
    return computation;
  }

  try {
    const reasoning = await Promise.race([
      fetchAiReasoning(computation, snapshot),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), AI_TIMEOUT_MS)),
    ]);

    if (!reasoning) {
      return computation;
    }

    return {
      ...computation,
      explanation: reasoning.explanation || computation.explanation,
      factors: reasoning.factors.length > 0 ? reasoning.factors : computation.factors,
      confidence: Math.min(computation.confidence + 0.05, 0.95),
    };
  } catch {
    return computation;
  }
}

async function fetchAiReasoning(
  computation: ForecastComputation,
  snapshot: OperationalSnapshot,
) {
  const response = await callOpenRouter({
    messages: [
      {
        role: "system",
        content:
          "You are Project Harvest forecast intelligence. Return valid JSON only. Never take autonomous actions.",
      },
      {
        role: "user",
        content: buildForecastReasoningPrompt({
          forecastType: computation.forecastType,
          predictedValue: computation.predictedValue,
          snapshot,
        }),
      },
    ],
    responseFormat: "json_object",
    maxTokens: 1024,
  });

  return parseJsonResponse(response.content, forecastReasoningSchema);
}
