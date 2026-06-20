import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/services/upload/classification-service", () => ({
  classifyUpload: vi.fn().mockResolvedValue({
    classification: "inventory_sheet",
    confidence: 85,
  }),
}));

vi.mock("@/services/upload/extraction-service", () => ({
  extractUploadContent: vi.fn().mockResolvedValue({
    raw_text: "Milk,50,cartons",
    structured_json: JSON.stringify({ entities: [] }),
    confidence_score: 75,
    model_version: "test",
    content_type: "table",
    entities: [
      { id: "e1", entity_type: "inventory_item", name: "Milk", quantity: 50, confidence: 0.8 },
    ],
  }),
}));

vi.mock("@/services/upload/normalization-service", () => ({
  normalizeUploadContent: vi.fn().mockResolvedValue({
    classification: "inventory_sheet",
    rawText: "Milk,50,cartons",
    structuredJson: JSON.stringify({
      entities: [{ id: "e1", entity_type: "inventory_item", name: "Milk", confidence: 0.8 }],
    }),
    entities: [{ id: "e1", entity_type: "inventory_item", name: "Milk", confidence: 0.8 }],
    contentType: "table",
    overallConfidence: 0.8,
  }),
}));

vi.mock("@/services/upload/validation-service", () => ({
  validateUpload: vi.fn().mockResolvedValue([]),
}));

const mockGetUploadById = vi.fn();
const mockCreateJob = vi.fn();
const mockUpdateStatus = vi.fn();
const mockUpdateClassification = vi.fn();
const mockCreateExtraction = vi.fn();
const mockUpdateJobStatus = vi.fn();

vi.mock("@/services/upload/upload-service", () => ({
  getUploadById: (...args: unknown[]) => mockGetUploadById(...args),
  createUploadJob: (...args: unknown[]) => mockCreateJob(...args),
  updateUploadStatus: (...args: unknown[]) => mockUpdateStatus(...args),
  updateUploadClassification: (...args: unknown[]) => mockUpdateClassification(...args),
  createExtractionResult: (...args: unknown[]) => mockCreateExtraction(...args),
  updateUploadJobStatus: (...args: unknown[]) => mockUpdateJobStatus(...args),
}));

import { runUploadPipeline } from "@/services/upload/pipeline-service";

describe("pipeline-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUploadById.mockResolvedValue({
      id: "upload-1",
      organization_id: "org-1",
      file_name: "inventory.csv",
      file_type: "text/csv",
      storage_path: "uploads/test/inventory.csv",
      checksum: "abc",
      description: null,
    });
    mockCreateJob.mockResolvedValue({ id: "job-1" });
  });

  it("runs full pipeline and returns review_required", async () => {
    const result = await runUploadPipeline("upload-1");
    expect(result.status).toBe("review_required");
    expect(result.classification).toBe("inventory_sheet");
    expect(mockUpdateStatus).toHaveBeenCalled();
    expect(mockCreateExtraction).toHaveBeenCalled();
    expect(mockUpdateJobStatus).toHaveBeenCalledWith("job-1", "completed");
  });

  it("throws when upload not found", async () => {
    mockGetUploadById.mockResolvedValue(null);
    await expect(runUploadPipeline("missing")).rejects.toThrow("Upload not found");
  });
});
