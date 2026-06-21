import type { conversations, messages } from "@/db/schema";
import type {
  AssistantChatResponse,
  AssistantCitation,
  AssistantConversation,
  AssistantConversationDetail,
  AssistantMessage,
} from "@/types/assistant";
import type { MessageMetadata } from "./assistant-types";

type ConversationRow = typeof conversations.$inferSelect;
type MessageRow = typeof messages.$inferSelect;

export function mapConversation(row: ConversationRow, preview: string): AssistantConversation {
  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title ?? "New conversation",
    preview,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export function mapMessage(row: MessageRow): AssistantMessage {
  const metadata = (row.metadata ?? null) as MessageMetadata | null;
  const citations = (row.citations ?? []) as AssistantCitation[];

  const message: AssistantMessage = {
    id: row.id,
    role: row.role as AssistantMessage["role"],
    content: row.content,
    createdAt: row.created_at.toISOString(),
  };

  if (row.role === "assistant" && metadata) {
    message.response = {
      answer: row.content,
      confidence: metadata.confidence,
      reasoning: metadata.reasoning,
      citations,
      recommendedActions: metadata.recommendedActions,
    };
  }

  return message;
}

export function mapConversationDetail(
  row: ConversationRow,
  messageRows: MessageRow[],
): AssistantConversationDetail {
  const preview =
    messageRows.find((message) => message.role === "user")?.content.slice(0, 120) ?? "";
  return {
    ...mapConversation(row, preview),
    messages: messageRows.map(mapMessage),
  };
}

export function mapChatResponse(
  content: string,
  metadata: MessageMetadata,
  citations: AssistantCitation[],
): AssistantChatResponse {
  return {
    answer: content,
    confidence: metadata.confidence,
    reasoning: metadata.reasoning,
    citations,
    recommendedActions: metadata.recommendedActions,
  };
}
