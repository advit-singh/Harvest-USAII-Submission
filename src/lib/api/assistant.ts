import { apiClient } from "@/lib/api/client";
import {
  appendMockMessage,
  createMockConversation,
  getMockConversationById,
  getMockConversations,
} from "@/lib/mocks/assistant-fixtures";
import type {
  AssistantChatResponse,
  AssistantConversation,
  AssistantConversationDetail,
  AssistantMessage,
} from "@/types/assistant";

const MOCK_DELAY_MS = 400;

async function mockDelay(extra = 0): Promise<void> {
  const jitter = Math.floor(Math.random() * 400);
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS + jitter + extra));
}

export async function fetchConversations(
  orgId: string,
): Promise<AssistantConversation[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await mockDelay();
    return getMockConversations(orgId);
  }
  return apiClient<AssistantConversation[]>(
    `/assistant/conversations?organizationId=${orgId}`,
  );
}

export async function createConversation(
  orgId: string,
): Promise<AssistantConversationDetail> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await mockDelay(100);
    return createMockConversation(orgId);
  }
  return apiClient<AssistantConversationDetail>("/assistant/conversations", {
    method: "POST",
    body: JSON.stringify({ organizationId: orgId }),
  });
}

export async function fetchConversation(
  conversationId: string,
): Promise<AssistantConversationDetail> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await mockDelay();
    const conv = getMockConversationById(conversationId);
    if (!conv) {
      throw new Error("Conversation not found");
    }
    return conv;
  }
  return apiClient<AssistantConversationDetail>(
    `/assistant/conversations/${conversationId}`,
  );
}

export interface SendMessageInput {
  conversationId: string;
  message: string;
}

export interface SendMessageResult {
  response: AssistantChatResponse;
  userMessage: AssistantMessage;
  assistantMessage: AssistantMessage;
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<SendMessageResult> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await mockDelay(300);
    const { userMsg, assistantMsg } = appendMockMessage(
      input.conversationId,
      input.message,
    );
    if (!assistantMsg.response) {
      throw new Error("Assistant response missing");
    }
    return {
      response: assistantMsg.response,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    };
  }

  const response = await apiClient<AssistantChatResponse>("/assistant/chat", {
    method: "POST",
    body: JSON.stringify(input),
  });

  const conversation = await fetchConversation(input.conversationId);
  const messages = conversation.messages;
  const userMessage = messages[messages.length - 2];
  const assistantMessage = messages[messages.length - 1];

  return { response, userMessage, assistantMessage };
}
