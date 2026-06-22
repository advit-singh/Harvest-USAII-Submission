import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildNormalizedPayload, entitiesToReviewFields } from "@/services/upload/upload-types";

vi.mock("@/db/client", () => ({
  db: {
    query: {
      organizations: { findFirst: vi.fn().mockResolvedValue({ default_unit_system: "metric" }) },
      memory_mappings: { findMany: vi.fn().mockResolvedValue([]) },
    },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ onConflictDoNothing: vi.fn() }) }),
  },
}));

vi.mock("@/services/ai/ai-service", () => ({
  normalizeWithAi: vi.fn(),
  isAiConfigured: vi.fn().mockReturnValue(false),
}));

import { normalizeUploadContent } from "@/services/upload/normalization-service";

describe("normalization-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trims raw text and preserves entities without AI", async () => {
    const entities = [
      {
        id: "e1",
        entity_type: "inventory_item" as const,
        name: "Milk",
        confidence: 0.8,
      },
    ];

    const result = await normalizeUploadContent({
      classification: "inventory_sheet",
      rawText: "  Milk data  ",
      structuredJson: JSON.stringify({ entities }),
      organizationId: "org-1",
      entities,
      contentType: "table",
      overallConfidence: 0.75,
    });

    expect(result.rawText).toBe("Milk data");
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].name).toBe("Milk");
  });
});

describe("upload-types", () => {
  it("builds normalized payload with structured json", () => {
    const payload = buildNormalizedPayload({
      classification: "inventory_sheet",
      rawText: "data",
      entities: [],
      contentType: "text",
      overallConfidence: 0.6,
    });

    const parsed = JSON.parse(payload.structuredJson);
    expect(parsed.classification).toBe("inventory_sheet");
    expect(parsed.overallConfidence).toBe(0.6);
  });

  it("maps entities to review fields", () => {
    const fields = entitiesToReviewFields([
      {
        id: "e1",
        entity_type: "inventory_item",
        name: "Milk",
        confidence: 0.9,
      },
    ]);

    expect(fields[0].field).toBe("inventory item");
    expect(fields[0].value).toBe("Milk");
    expect(fields[0].editable).toBe(true);
  });
});
