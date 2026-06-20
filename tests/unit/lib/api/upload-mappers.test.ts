import { describe, expect, it } from "vitest";
import { toApiConfidence, toDbConfidence } from "@/lib/api/confidence";
import { mapUploadSummary } from "@/lib/api/upload-mappers";

describe("confidence helpers", () => {
  it("converts db integer to api decimal", () => {
    expect(toApiConfidence(87)).toBe(0.87);
    expect(toApiConfidence(0.87)).toBe(0.87);
  });

  it("converts api decimal to db integer", () => {
    expect(toDbConfidence(0.87)).toBe(87);
    expect(toDbConfidence(87)).toBe(87);
  });
});

describe("upload mappers", () => {
  it("maps upload summary with api confidence", () => {
    const summary = mapUploadSummary({
      id: "id-1",
      organization_id: "org-1",
      site_id: "site-1",
      file_name: "inventory.csv",
      file_type: "text/csv",
      file_size: 100,
      processing_status: "review_required",
      classification: "inventory_sheet",
      confidence_score: 85,
      created_at: "2026-06-20T10:00:00Z",
      updated_at: "2026-06-20T10:01:00Z",
    });

    expect(summary.confidence).toBe(0.85);
    expect(summary.stage).toBe("validated");
    expect(summary.progress).toBe(90);
  });
});
