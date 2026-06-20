import { describe, expect, it } from "vitest";
import { classifyUpload } from "@/services/upload/classification-service";

describe("classification-service", () => {
  it("classifies inventory CSV via heuristic", async () => {
    const result = await classifyUpload({
      file_name: "march-inventory.csv",
      file_type: "text/csv",
    });
    expect(result.classification).toBe("inventory_sheet");
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("classifies attendance report via keyword", async () => {
    const result = await classifyUpload({
      file_name: "attendance-report.pdf",
      file_type: "application/pdf",
      description: "weekly attendance",
    });
    expect(result.classification).toBe("attendance_report");
  });

  it("returns unknown for ambiguous files", async () => {
    const result = await classifyUpload({
      file_name: "document.bin",
      file_type: "application/octet-stream",
    });
    expect(result.classification).toBe("unknown");
  });
});
