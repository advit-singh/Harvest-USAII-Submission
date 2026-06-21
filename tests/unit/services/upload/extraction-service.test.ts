import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    storage: {
      from: vi.fn().mockReturnValue({
        download: vi.fn().mockResolvedValue({
          data: {
            type: "text/plain",
            arrayBuffer: async () =>
              new TextEncoder().encode("Milk, 2 gal\nBread, 5 loaves").buffer,
          },
          error: null,
        }),
      }),
    },
  }),
}));

vi.mock("@/lib/parsers", () => ({
  parseFileContent: vi.fn().mockResolvedValue({
    rawText: "Milk, 2 gal\nBread, 5 loaves",
    contentType: "text",
  }),
}));

vi.mock("@/services/ai/ai-service", () => ({
  extractWithAi: vi.fn(),
  isAiConfigured: vi.fn().mockReturnValue(false),
}));

import { extractWithAi } from "@/services/ai/ai-service";
import { extractUploadContent } from "@/services/upload/extraction-service";

describe("extraction-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds fallback entities when OpenRouter is not configured", async () => {
    const result = await extractUploadContent("org/uploads/inventory.csv");

    expect(extractWithAi).not.toHaveBeenCalled();
    expect(result.entities).toHaveLength(2);
    expect(result.entities[0]?.entity_type).toBe("inventory_item");
    expect(result.model_version).toBe("local-parser-v1");
    expect(result.content_type).toBe("text");
    expect(JSON.parse(result.structured_json).entities).toHaveLength(2);
  });

  it("throws when storage download fails", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValueOnce({
      storage: {
        from: vi.fn().mockReturnValue({
          download: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Object not found" },
          }),
        }),
      },
    } as never);

    await expect(extractUploadContent("missing/file.csv")).rejects.toThrow("Object not found");
  });
});
