import { describe, expect, it } from "vitest";
import { mapChatResponse, mapMessage } from "@/services/assistant/assistant-mappers";

describe("assistant-mappers", () => {
  it("maps assistant message metadata into response", () => {
    const message = mapMessage({
      id: "msg_1",
      conversation_id: "conv_1",
      role: "assistant",
      content: "Waste increased due to attendance variance.",
      citations: [
        {
          id: "cite_waste",
          sourceType: "waste",
          title: "Waste analytics",
          excerpt: "Weekly trend",
          href: "/analytics?tab=waste",
        },
      ],
      metadata: {
        reasoning: "Compared weekly waste totals.",
        confidence: 0.82,
        recommendedActions: [
          { id: "act_1", label: "Review forecasts", href: "/predictions?tab=explorer" },
        ],
      },
      created_at: new Date("2026-06-01T10:00:00Z"),
      updated_at: new Date("2026-06-01T10:00:00Z"),
      created_by: null,
    });

    expect(message.response?.confidence).toBe(0.82);
    expect(message.response?.citations).toHaveLength(1);
    expect(message.response?.recommendedActions?.[0]?.label).toBe("Review forecasts");
  });

  it("maps chat response envelope", () => {
    const response = mapChatResponse(
      "Answer text",
      { reasoning: "Because data", confidence: 0.9 },
      [],
    );
    expect(response.answer).toBe("Answer text");
    expect(response.reasoning).toBe("Because data");
  });
});
