import { describe, expect, it } from "vitest";
import { SUGGESTED_PROMPTS } from "@/features/assistant/config/suggested-prompts";

describe("SUGGESTED_PROMPTS", () => {
  it("includes FRONTEND_SPEC example questions", () => {
    const labels = SUGGESTED_PROMPTS.map((p) => p.label);
    expect(labels).toContain("Why was waste higher this month?");
    expect(labels).toContain("What inventory should we prioritize?");
    expect(labels).toContain("What food expires next week?");
    expect(labels).toContain("Which events generated the most waste?");
  });

  it("has unique ids", () => {
    const ids = SUGGESTED_PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
