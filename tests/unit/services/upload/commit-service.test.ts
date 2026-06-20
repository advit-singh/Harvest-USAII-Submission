import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetUploadById = vi.fn();
const mockGetUploadReview = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/services/upload/upload-service", () => ({
  getUploadById: (...args: unknown[]) => mockGetUploadById(...args),
  getUploadReview: (...args: unknown[]) => mockGetUploadReview(...args),
}));

vi.mock("@/db/client", () => ({
  db: {
    transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
    query: {
      inventory_categories: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "item-1" }]),
      }),
    }),
  },
}));

import { commitUploadData } from "@/services/upload/commit-service";

describe("commit-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUploadById.mockResolvedValue({
      id: "upload-1",
      organization_id: "org-1",
      site_id: "site-1",
    });

    mockGetUploadReview.mockResolvedValue({
      extractions: [
        {
          structured_json: JSON.stringify({
            classification: "inventory_sheet",
            entities: [
              {
                id: "e1",
                entity_type: "inventory_item",
                name: "Milk",
                quantity: 50,
                unit: "cartons",
                confidence: 0.9,
              },
            ],
          }),
        },
      ],
    });

    mockTransaction.mockImplementation(async (fn) => {
      const tx = {
        query: {
          inventory_categories: {
            findFirst: vi.fn().mockResolvedValue(null),
          },
        },
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ id: "new-id" }]),
          }),
        }),
      };
      await fn(tx);
    });
  });

  it("commits inventory entities from extraction", async () => {
    const result = await commitUploadData("upload-1");
    expect(result.inventoryItems).toBeGreaterThan(0);
    expect(result.inventoryLots).toBeGreaterThan(0);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("throws when upload not found", async () => {
    mockGetUploadById.mockResolvedValue(null);
    await expect(commitUploadData("missing")).rejects.toThrow("Upload not found");
  });

  it("throws when no extraction data", async () => {
    mockGetUploadReview.mockResolvedValue({ extractions: [] });
    await expect(commitUploadData("upload-1")).rejects.toThrow("No extraction data");
  });
});
