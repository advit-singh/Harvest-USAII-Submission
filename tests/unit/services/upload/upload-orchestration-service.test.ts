import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCommitUploadData = vi.fn();
const mockUpdateUploadStatus = vi.fn();
const mockGetUploadById = vi.fn();
const mockRefreshSiteIntelligence = vi.fn();
const mockNotifyUploadCompleted = vi.fn();
const mockGetOrganizationSettings = vi.fn();
const mockNotifyValidationWarning = vi.fn();

vi.mock("@/services/upload/commit-service", () => ({
  commitUploadData: (...args: unknown[]) => mockCommitUploadData(...args),
}));

vi.mock("@/services/upload/upload-service", () => ({
  getUploadById: (...args: unknown[]) => mockGetUploadById(...args),
  updateUploadStatus: (...args: unknown[]) => mockUpdateUploadStatus(...args),
}));

vi.mock("@/services/intelligence/intelligence-trigger", () => ({
  refreshSiteIntelligence: (...args: unknown[]) => mockRefreshSiteIntelligence(...args),
}));

vi.mock("@/services/notification/notification-emitter", () => ({
  notifyUploadCompleted: (...args: unknown[]) => mockNotifyUploadCompleted(...args),
  notifyValidationWarning: (...args: unknown[]) => mockNotifyValidationWarning(...args),
}));

vi.mock("@/services/organization/settings-service", () => ({
  getOrganizationSettings: (...args: unknown[]) => mockGetOrganizationSettings(...args),
}));

import {
  evaluateUploadAutoCommit,
  finalizeUpload,
  notifyReviewRequiredWarnings,
} from "@/services/upload/upload-orchestration-service";

describe("upload-orchestration-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUploadById.mockResolvedValue({
      id: "upload-1",
      organization_id: "org-1",
      site_id: "site-1",
      uploaded_by: "user-1",
      file_name: "inventory.csv",
    });
    mockCommitUploadData.mockResolvedValue({
      inventoryItems: 2,
      inventoryLots: 2,
      attendanceRecords: 0,
      wasteEvents: 0,
      events: 0,
      purchases: 0,
    });
    mockRefreshSiteIntelligence.mockResolvedValue({
      forecastsGenerated: 3,
      opportunitiesSynced: 1,
      impactRecomputed: true,
    });
    mockGetOrganizationSettings.mockResolvedValue({
      ai: {
        autoCommitEnabled: true,
        autoCommitConfidenceThreshold: 0.85,
      },
    });
  });

  it("evaluates auto-commit using organization settings", async () => {
    const result = await evaluateUploadAutoCommit({
      organizationId: "org-1",
      normalized: {
        classification: "inventory_sheet",
        rawText: "data",
        structuredJson: "{}",
        entities: [{ id: "e1", entity_type: "inventory_item", confidence: 0.9 }],
        contentType: "table",
        overallConfidence: 0.92,
      },
      validationIssues: [],
    });

    expect(result.eligible).toBe(true);
    expect(mockGetOrganizationSettings).toHaveBeenCalledWith("org-1");
  });

  it("finalizes upload with commit, status update, and intelligence refresh", async () => {
    const result = await finalizeUpload("upload-1", {
      userId: "user-1",
      awaitIntelligenceRefresh: true,
    });

    expect(mockCommitUploadData).toHaveBeenCalledWith("upload-1", undefined);
    expect(mockUpdateUploadStatus).toHaveBeenCalledWith("upload-1", "completed");
    expect(mockRefreshSiteIntelligence).toHaveBeenCalledWith("org-1", "site-1", "user-1");
    expect(mockNotifyUploadCompleted).toHaveBeenCalled();
    expect(result.status).toBe("completed");
    expect(result.committed.inventoryItems).toBe(2);
    expect(result.intelligenceRefresh?.forecastsGenerated).toBe(3);
  });

  it("throws when upload is missing during finalize", async () => {
    mockGetUploadById.mockResolvedValue(null);
    await expect(finalizeUpload("missing")).rejects.toThrow("Upload not found.");
  });

  it("sends validation warning notification for review-required uploads", async () => {
    await notifyReviewRequiredWarnings({
      organizationId: "org-1",
      userId: "user-1",
      uploadId: "upload-1",
      validationIssues: [
        { type: "attendance_spike", severity: "warning", reason: "Attendance unusually high." },
      ],
    });

    expect(mockNotifyValidationWarning).toHaveBeenCalledWith(
      expect.objectContaining({
        uploadId: "upload-1",
        message: "Attendance unusually high.",
      }),
    );
  });
});
