import { describe, expect, it, vi, beforeEach } from "vitest";

const mockFindFirst = vi.fn();
const mockCreateAnomaly = vi.fn().mockImplementation(async (_uploadId, type, severity, reason, confidence) => ({
  id: `anomaly-${type}`,
  type,
  severity,
  reason,
  confidence,
}));

vi.mock("@/db/client", () => ({
  db: {
    query: {
      uploads: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
  },
}));

vi.mock("@/services/upload/upload-service", () => ({
  createValidationAnomaly: (...args: unknown[]) => mockCreateAnomaly(...args),
}));

import { validateUpload } from "@/services/upload/validation-service";
import { buildNormalizedPayload } from "@/services/upload/upload-types";

describe("validation-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue(null);
  });

  it("flags unknown classification", async () => {
    const payload = buildNormalizedPayload({
      classification: "unknown",
      rawText: "some content here",
      entities: [{ id: "e1", entity_type: "inventory_item", name: "Milk", confidence: 0.5 }],
      contentType: "text",
      overallConfidence: 0.5,
    });

    const issues = await validateUpload("upload-1", "org-1", "checksum-1", payload);
    expect(issues.some((i) => i.type === "missing_field")).toBe(true);
    expect(mockCreateAnomaly).toHaveBeenCalled();
  });

  it("detects duplicate uploads by checksum", async () => {
    mockFindFirst.mockResolvedValue({ id: "other-upload" });

    const payload = buildNormalizedPayload({
      classification: "inventory_sheet",
      rawText: "inventory data with enough length",
      entities: [{ id: "e1", entity_type: "inventory_item", name: "Milk", confidence: 0.8 }],
      contentType: "table",
      overallConfidence: 0.8,
    });

    const issues = await validateUpload("upload-1", "org-1", "dup-checksum", payload);
    expect(issues.some((i) => i.type === "duplicate_upload")).toBe(true);
  });

  it("flags attendance spikes", async () => {
    const payload = buildNormalizedPayload({
      classification: "attendance_report",
      rawText: "attendance data for the week",
      entities: [
        {
          id: "e1",
          entity_type: "attendance_record",
          value: 6000,
          confidence: 0.7,
        },
      ],
      contentType: "text",
      overallConfidence: 0.7,
    });

    const issues = await validateUpload("upload-1", "org-1", "checksum-2", payload);
    expect(issues.some((i) => i.type === "attendance_spike")).toBe(true);
  });
});
