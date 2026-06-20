import { describe, expect, it } from "vitest";
import {
  UPLOAD_STAGES,
  STATUS_LABELS,
  getStageIndex,
} from "@/features/uploads/config/upload-stages";
import {
  isProcessingUploadStatus,
  isTerminalUploadStatus,
} from "@/types/upload";

describe("upload-stages", () => {
  it("defines five pipeline stages", () => {
    expect(UPLOAD_STAGES).toHaveLength(5);
    expect(UPLOAD_STAGES.map((s) => s.id)).toEqual([
      "uploaded",
      "classified",
      "extracted",
      "validated",
      "completed",
    ]);
  });

  it("maps status labels for all states", () => {
    expect(STATUS_LABELS.review_required).toBe("Review required");
    expect(STATUS_LABELS.completed).toBe("Completed");
  });

  it("returns stage index", () => {
    expect(getStageIndex("extracted")).toBe(2);
    expect(getStageIndex("unknown")).toBe(-1);
  });

  it("identifies processing and terminal statuses", () => {
    expect(isProcessingUploadStatus("extracting")).toBe(true);
    expect(isTerminalUploadStatus("completed")).toBe(true);
    expect(isTerminalUploadStatus("review_required")).toBe(false);
  });
});
