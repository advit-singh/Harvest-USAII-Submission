import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSelectChain } from "../../../helpers/db-mock";
import { DEMO_FORECAST_ID, DEMO_ORG_ID, DEMO_REC_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

vi.mock("@/services/analytics/analytics-service", () => ({
  getDashboardOverview: vi.fn().mockResolvedValue({ riskLevel: "medium", riskScore: 55 }),
  getWasteAnalytics: vi.fn().mockResolvedValue({
    summary: [{ value: 42 }],
    rootCause: { drivers: [{ name: "overproduction" }], summary: "Overproduction led waste" },
  }),
  getInventoryAnalytics: vi.fn().mockResolvedValue({
    turnoverRate: 0.6,
    storageUtilization: 72,
    expirationRisk: [{ id: "expiring-soon" }],
  }),
  getAttendanceAnalytics: vi.fn().mockResolvedValue({ forecastAccuracy: 0.81 }),
  getDonationAnalytics: vi.fn().mockResolvedValue({ mealsRescued: 120, successRate: 0.9 }),
  getImpactAnalytics: vi.fn().mockResolvedValue({
    summary: [{ label: "Meals saved", value: 120, unit: " meals" }],
  }),
}));

import { retrieveOrganizationContext } from "@/services/assistant/retrieval-service";

describe("retrieval-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let call = 0;
    mockSelect.mockImplementation(() => {
      call += 1;
      if (call === 1) {
        return createSelectChain([
          {
            id: DEMO_FORECAST_ID,
            forecast_type: "surplus",
            predicted_value: "80",
            confidence_score: 85,
            explanation: "Exam week lowers attendance",
          },
        ]);
      }
      if (call === 2) {
        return createSelectChain([
          {
            id: DEMO_REC_ID,
            title: "Reduce dairy orders",
            description: "Scale back dairy purchasing",
            priority: "high",
            confidence_score: 78,
          },
        ]);
      }
      return createSelectChain([{ quantity: "5", reason: "expiration" }]);
    });
  });

  it("retrieveOrganizationContext assembles summaries and citations", async () => {
    const bundle = await retrieveOrganizationContext({ organizationId: DEMO_ORG_ID });

    expect(bundle.wasteSummary).toContain("medium");
    expect(bundle.wasteSummary).toContain("42");
    expect(bundle.forecastSummary).toContain("surplus");
    expect(bundle.recommendationSummary).toContain("Reduce dairy orders");
    expect(bundle.citations.some((c) => c.sourceType === "waste")).toBe(true);
    expect(bundle.citations.some((c) => c.sourceType === "forecast")).toBe(true);
    expect(bundle.citations.some((c) => c.sourceType === "recommendation")).toBe(true);
  });
});
