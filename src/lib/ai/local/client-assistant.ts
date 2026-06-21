"use client";

import { callLlm } from "@/lib/ai/llm-provider";
import {
  buildAssistantSystemPrompt,
  buildAssistantUserPrompt,
} from "@/lib/ai/prompts/assistant";
import { assistantResponseSchema, parseJsonResponse } from "@/lib/ai/response-parser";
import { buildClientOrgContext } from "@/lib/ai/local/client-org-context";
import { matchFixtureResponse } from "@/lib/mocks/assistant-fixtures";
import type { AssistantChatResponse } from "@/types/assistant";

export async function generateLocalAssistantResponse(input: {
  orgId: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
}): Promise<AssistantChatResponse> {
  const { context, citations } = buildClientOrgContext(input.orgId);
  const citationIds = citations.map((c) => c.id);

  try {
    const { content } = await callLlm({
      system: buildAssistantSystemPrompt(),
      user: buildAssistantUserPrompt({
        message: input.message,
        context,
        history: input.history ?? [],
        citationIds,
      }),
      jsonMode: true,
      maxTokens: 512,
    });

    const parsed = parseJsonResponse(content, assistantResponseSchema);

    const citedIds = parsed.citedSourceIds ?? [];
    const mappedCitations = citations
      .filter((c) => citedIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        sourceType: c.sourceType as AssistantChatResponse["citations"][0]["sourceType"],
        title: c.title,
        excerpt: c.excerpt,
        href: c.href,
      }));

    return {
      answer: parsed.answer,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      citations: mappedCitations.length > 0 ? mappedCitations : citations.slice(0, 2).map((c) => ({
        id: c.id,
        sourceType: c.sourceType as AssistantChatResponse["citations"][0]["sourceType"],
        title: c.title,
        excerpt: c.excerpt,
        href: c.href,
      })),
      recommendedActions: parsed.recommendedActions ?? [],
    };
  } catch {
    return matchFixtureResponse(input.message);
  }
}
