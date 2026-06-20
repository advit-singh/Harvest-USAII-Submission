import { describe, expect, it } from "vitest";
import { chatMessageSchema } from "@/features/assistant/schemas/chat.schema";

describe("chatMessageSchema", () => {
  it("accepts valid messages", () => {
    const result = chatMessageSchema.safeParse({
      message: "Why was waste higher this week?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages", () => {
    const result = chatMessageSchema.safeParse({ message: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects messages over 4000 characters", () => {
    const result = chatMessageSchema.safeParse({
      message: "a".repeat(4001),
    });
    expect(result.success).toBe(false);
  });
});
