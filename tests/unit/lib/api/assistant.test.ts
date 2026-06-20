import { describe, expect, it, beforeEach } from "vitest";
import {
  createConversation,
  fetchConversation,
  fetchConversations,
  sendMessage,
} from "@/lib/api/assistant";
import { resetMockAssistant } from "@/lib/mocks/assistant-fixtures";

describe("assistant mock API", () => {
  beforeEach(() => {
    resetMockAssistant();
  });

  it("returns seeded conversations for demo org", async () => {
    const items = await fetchConversations("org_demo_123");
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].title).toContain("waste");
  });

  it("creates a new conversation", async () => {
    const conv = await createConversation("org_demo_123");
    expect(conv.id).toBeTruthy();
    expect(conv.messages).toHaveLength(0);

    const list = await fetchConversations("org_demo_123");
    expect(list.some((c) => c.id === conv.id)).toBe(true);
  });

  it("sends a message and returns explainable response", async () => {
    const conv = await createConversation("org_test");
    const result = await sendMessage({
      conversationId: conv.id,
      message: "Why was waste higher this month?",
    });

    expect(result.response.answer).toBeTruthy();
    expect(result.response.confidence).toBeGreaterThan(0);
    expect(result.response.reasoning).toBeTruthy();
    expect(result.response.citations.length).toBeGreaterThan(0);

    const updated = await fetchConversation(conv.id);
    expect(updated.messages.length).toBe(2);
  });

  it("returns wow moment response for Thursday projection questions", async () => {
    const conv = await createConversation("org_test");
    const result = await sendMessage({
      conversationId: conv.id,
      message: "What is projected for next Thursday?",
    });

    expect(result.response.answer).toContain("47 meals");
    expect(result.response.recommendedActions?.length).toBeGreaterThan(0);
  });
});
