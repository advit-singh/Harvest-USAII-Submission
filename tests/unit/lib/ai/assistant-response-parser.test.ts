import { describe, expect, it } from "vitest";
import {
  assistantResponseSchema,
  parseJsonResponse,
} from "@/lib/ai/response-parser";

describe("assistant-response-parser", () => {
  it("parses valid assistant JSON", () => {
    const parsed = parseJsonResponse(
      JSON.stringify({
        answer: "Waste increased.",
        reasoning: "Attendance dropped.",
        confidence: 0.86,
        recommendedActions: [],
        citedSourceIds: ["cite_waste"],
      }),
      assistantResponseSchema,
    );

    expect(parsed.answer).toBe("Waste increased.");
    expect(parsed.confidence).toBe(0.86);
    expect(parsed.citedSourceIds).toEqual(["cite_waste"]);
  });

  it("rejects invalid confidence", () => {
    expect(() =>
      assistantResponseSchema.parse({
        answer: "x",
        reasoning: "y",
        confidence: 1.5,
      }),
    ).toThrow();
  });
});
