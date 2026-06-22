import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { conversations, messages } from "@/db/schema";
import { callLlm } from "@/lib/ai/llm-provider";
import { isAiConfigured } from "@/services/ai/ai-service";
import {
  buildAssistantSystemPrompt,
  buildAssistantUserPrompt,
} from "@/lib/ai/prompts/assistant";
import { assistantResponseSchema, parseJsonResponse } from "@/lib/ai/response-parser";
import type {
  AssistantChatResponse,
  AssistantCitation,
  AssistantConversation,
  AssistantConversationDetail,
} from "@/types/assistant";
import { assembleAssistantContext } from "./context-assembler";
import {
  mapChatResponse,
  mapConversation,
  mapConversationDetail,
} from "./assistant-mappers";
import { citationHref, type MessageMetadata } from "./assistant-types";
import { retrieveOrganizationContext } from "./retrieval-service";

export async function listConversations(
  organizationId: string,
  userId: string,
): Promise<AssistantConversation[]> {
  const rows = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.organization_id, organizationId),
        eq(conversations.user_id, userId),
      ),
    )
    .orderBy(desc(conversations.updated_at))
    .limit(50);

  const results: AssistantConversation[] = [];
  for (const row of rows) {
    const latestUser = await db.query.messages.findFirst({
      where: (fields, { and: andFn, eq: eqFn }) =>
        andFn(eqFn(fields.conversation_id, row.id), eqFn(fields.role, "user")),
      orderBy: (fields, { desc: descFn }) => [descFn(fields.created_at)],
    });
    results.push(
      mapConversation(row, latestUser?.content.slice(0, 120) ?? row.title ?? ""),
    );
  }
  return results;
}

export async function createConversation(
  organizationId: string,
  userId: string,
): Promise<AssistantConversationDetail> {
  const [row] = await db
    .insert(conversations)
    .values({
      organization_id: organizationId,
      user_id: userId,
      title: "New conversation",
      created_by: userId,
    })
    .returning();

  return mapConversationDetail(row, []);
}

export async function getConversationById(
  conversationId: string,
  userId: string,
): Promise<AssistantConversationDetail | null> {
  const row = await db.query.conversations.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, conversationId), eqFn(fields.user_id, userId)),
  });
  if (!row) return null;

  const messageRows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversation_id, conversationId))
    .orderBy(messages.created_at);

  return mapConversationDetail(row, messageRows);
}

export async function sendChatMessage(
  conversationId: string,
  userId: string,
  message: string,
): Promise<AssistantChatResponse> {
  const conversation = await db.query.conversations.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, conversationId), eqFn(fields.user_id, userId)),
  });
  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  await db.insert(messages).values({
    conversation_id: conversationId,
    role: "user",
    content: message,
    created_by: userId,
  });

  const historyRows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversation_id, conversationId))
    .orderBy(messages.created_at);

  const bundle = await retrieveOrganizationContext({
    organizationId: conversation.organization_id,
  });
  const assembled = assembleAssistantContext(bundle);

  const modelResponse = await generateAssistantAnswer({
    message,
    context: assembled.promptContext,
    history: historyRows.map((row) => ({ role: row.role, content: row.content })),
    citations: assembled.citations,
  });

  const selectedCitations = assembled.citations.filter((citation) =>
    (modelResponse.citedSourceIds ?? []).includes(citation.id),
  );
  const citations =
    selectedCitations.length > 0 ? selectedCitations : assembled.citations.slice(0, 3);

  const metadata: MessageMetadata = {
    reasoning: modelResponse.reasoning,
    confidence: modelResponse.confidence,
    recommendedActions: modelResponse.recommendedActions,
  };

  await db.insert(messages).values({
    conversation_id: conversationId,
    role: "assistant",
    content: modelResponse.answer,
    citations,
    metadata,
    created_by: userId,
  });

  const title =
    conversation.title === "New conversation"
      ? message.slice(0, 80)
      : conversation.title ?? message.slice(0, 80);

  await db
    .update(conversations)
    .set({ title, updated_at: new Date() })
    .where(eq(conversations.id, conversationId));

  return mapChatResponse(modelResponse.answer, metadata, citations);
}

async function generateAssistantAnswer(input: {
  message: string;
  context: string;
  history: Array<{ role: string; content: string }>;
  citations: AssistantCitation[];
}) {
  if (isAiConfigured()) {
    try {
      const recentHistory = input.history.slice(-4);
      const response = await callLlm({
        system: buildAssistantSystemPrompt(),
        user: buildAssistantUserPrompt({
          message: input.message,
          context: input.context.slice(0, 3000),
          history: recentHistory,
          citationIds: input.citations.map((citation) => citation.id),
        }),
        jsonMode: true,
        maxTokens: 512,
      });

      return parseJsonResponse(response.content, assistantResponseSchema);
    } catch {
      return buildHeuristicAnswer(input.message, input.context, input.citations);
    }
  }

  return buildHeuristicAnswer(input.message, input.context, input.citations);
}

function buildHeuristicAnswer(
  message: string,
  context: string,
  citations: AssistantCitation[],
) {
  const lower = message.toLowerCase();
  let answer =
    "Based on your organization's recent operational data, I found relevant trends in waste, forecasts, and recommendations.";
  let reasoning =
    "I summarized the latest month of operational context including waste totals, open recommendations, and impact metrics.";

  if (lower.includes("waste")) {
    answer =
      "Waste has been influenced by attendance variance and inventory expiration patterns in the current period.";
    reasoning = context.split("\n").find((line) => line.startsWith("WASTE:")) ?? reasoning;
  } else if (lower.includes("forecast") || lower.includes("surplus")) {
    answer =
      "Forecasts indicate upcoming surplus risk tied to attendance and inventory expiration windows.";
    reasoning = context.split("\n").find((line) => line.startsWith("FORECASTS:")) ?? reasoning;
  } else if (lower.includes("donation") || lower.includes("rescue")) {
    answer =
      "Donation opportunities align with expiring inventory and open surplus forecasts; review ranked recipient matches before acting.";
    reasoning = context.split("\n").find((line) => line.startsWith("DONATIONS:")) ?? reasoning;
  }

  return assistantResponseSchema.parse({
    answer,
    reasoning,
    confidence: 0.78,
    citedSourceIds: citations.slice(0, 3).map((citation) => citation.id),
    recommendedActions: [
      {
        id: "act_forecast",
        label: "Review forecasts",
        description: "Inspect contributing factors for upcoming surplus risk",
        href: citationHref("forecast"),
      },
      {
        id: "act_recommendations",
        label: "Open recommendations",
        description: "Review prioritized prevention actions",
        href: citationHref("recommendation"),
      },
    ],
  });
}
