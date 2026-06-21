import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCallOpenRouter = vi.fn();

vi.mock("@/lib/ai/openrouter-client", () => ({
  callOpenRouter: (...args: unknown[]) => mockCallOpenRouter(...args),
  isOpenRouterConfigured: vi.fn().mockReturnValue(true),
}));

import { classifyWithAi, extractWithAi } from "@/services/ai/ai-service";

describe("ai-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("classifyWithAi parses OpenRouter JSON response", async () => {
    mockCallOpenRouter.mockResolvedValue({
      content: JSON.stringify({
        classification: "inventory_sheet",
        confidence: 0.92,
        reasoning: "Tabular inventory columns detected",
      }),
    });

    const result = await classifyWithAi({
      fileName: "inventory.csv",
      fileType: "text/csv",
      contentPreview: "item,qty,unit",
    });

    expect(mockCallOpenRouter).toHaveBeenCalled();
    expect(result.classification).toBe("inventory_sheet");
    expect(result.confidence).toBe(0.92);
  });

  it("extractWithAi parses entity extraction response", async () => {
    mockCallOpenRouter.mockResolvedValue({
      content: JSON.stringify({
        entities: [
          {
            entity_type: "inventory_item",
            name: "Milk",
            quantity: 2,
            unit: "gal",
            confidence: 0.88,
          },
        ],
        overall_confidence: 0.85,
        summary: "Two inventory lines extracted",
      }),
    });

    const result = await extractWithAi({
      classification: "inventory_sheet",
      content: "Milk, 2 gal",
    });

    expect(result.entities).toHaveLength(1);
    expect(result.entities[0]?.name).toBe("Milk");
    expect(result.overall_confidence).toBe(0.85);
  });
});
