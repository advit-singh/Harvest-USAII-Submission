import { describe, expect, it, vi } from "vitest";
import { evaluateAutoCommitEligibility } from "@/services/upload/auto-commit-rules";
import { finalizeUpload } from "@/services/upload/upload-orchestration-service";

const mockCommitUploadData = vi.fn();
const mockUpdateUploadStatus = vi.fn();
const mockGetUploadById = vi.fn();
const mockRefreshSiteIntelligence = vi.fn();

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
  notifyUploadCompleted: vi.fn(),
  notifyValidationWarning: vi.fn(),
}));

describe("e2e intelligence pipeline integration", () => {
  it("auto-commit eligibility leads to finalize and intelligence refresh", async () => {
    const eligibility = evaluateAutoCommitEligibility({
      classification: "inventory_sheet",
      overallConfidence: 0.92,
      entityCount: 2,
      validationIssues: [],
      aiSettings: {
        autoCommitEnabled: true,
        autoCommitConfidenceThreshold: 0.85,
      },
    });

    expect(eligibility.eligible).toBe(true);

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

    const finalized = await finalizeUpload("upload-1", {
      userId: "user-1",
      awaitIntelligenceRefresh: true,
    });

    expect(finalized.status).toBe("completed");
    expect(finalized.committed.inventoryItems).toBe(2);
    expect(finalized.intelligenceRefresh).toEqual({
      forecastsGenerated: 3,
      opportunitiesSynced: 1,
      impactRecomputed: true,
    });
    expect(mockRefreshSiteIntelligence).toHaveBeenCalledWith("org-1", "site-1", "user-1");
  });
});
