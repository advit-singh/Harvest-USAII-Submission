import { describe, expect, it } from "vitest";
import {
  extractJsonFromText,
  parseJsonResponse,
  classificationResponseSchema,
} from "@/lib/ai/response-parser";

describe("response-parser", () => {
  it("extracts JSON from fenced code block", () => {
    const text = '```json\n{"classification":"receipt","confidence":0.9}\n```';
    const json = extractJsonFromText(text);
    expect(JSON.parse(json)).toEqual({ classification: "receipt", confidence: 0.9 });
  });

  it("parses classification response with schema", () => {
    const result = parseJsonResponse(
      '{"classification":"inventory_sheet","confidence":0.87,"reasoning":"CSV headers"}',
      classificationResponseSchema,
    );
    expect(result.classification).toBe("inventory_sheet");
    expect(result.confidence).toBe(0.87);
  });

  it("rejects invalid classification", () => {
    expect(() =>
      parseJsonResponse('{"classification":"invalid","confidence":0.5}', classificationResponseSchema),
    ).toThrow();
  });
});
