import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGenerateAllForecastTypes = vi.fn();
const mockSyncDonationOpportunities = vi.fn();
const mockRecomputeImpactSnapshot = vi.fn();
const mockNotifyForecastGenerated = vi.fn();

vi.mock("@/services/forecast/forecast-service", () => ({
  generateAllForecastTypes: (...args: unknown[]) => mockGenerateAllForecastTypes(...args),
}));

vi.mock("@/services/donation/donation-opportunity-service", () => ({
  syncDonationOpportunities: (...args: unknown[]) => mockSyncDonationOpportunities(...args),
}));

vi.mock("@/services/impact/impact-service", () => ({
  recomputeImpactSnapshot: (...args: unknown[]) => mockRecomputeImpactSnapshot(...args),
}));

vi.mock("@/services/notification/notification-emitter", () => ({
  notifyForecastGenerated: (...args: unknown[]) => mockNotifyForecastGenerated(...args),
}));

import { refreshSiteIntelligence } from "@/services/intelligence/intelligence-trigger";

describe("intelligence-trigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateAllForecastTypes.mockResolvedValue(undefined);
    mockSyncDonationOpportunities.mockResolvedValue(2);
    mockRecomputeImpactSnapshot.mockResolvedValue(undefined);
  });

  it("runs forecast, donation sync, and impact recompute in order", async () => {
    const result = await refreshSiteIntelligence("org-1", "site-1", "user-1");

    expect(mockGenerateAllForecastTypes).toHaveBeenCalledWith("org-1", "site-1", "user-1");
    expect(mockSyncDonationOpportunities).toHaveBeenCalledWith({
      organizationId: "org-1",
      siteId: "site-1",
      createdBy: "user-1",
    });
    expect(mockRecomputeImpactSnapshot).toHaveBeenCalledWith("org-1", "site-1");
    expect(mockNotifyForecastGenerated).toHaveBeenCalled();
    expect(result).toEqual({
      forecastsGenerated: 3,
      opportunitiesSynced: 2,
      impactRecomputed: true,
    });
  });

  it("returns partial result when a stage fails", async () => {
    mockSyncDonationOpportunities.mockRejectedValue(new Error("sync failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await refreshSiteIntelligence("org-1", "site-1");

    expect(result.forecastsGenerated).toBe(3);
    expect(result.opportunitiesSynced).toBe(0);
    expect(result.impactRecomputed).toBe(false);
    consoleSpy.mockRestore();
  });
});
