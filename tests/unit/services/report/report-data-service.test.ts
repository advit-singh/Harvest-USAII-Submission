import { describe, expect, it, vi } from "vitest";
import { DEMO_ORG_ID, DEMO_SITE_ID } from "../../../helpers/service-fixtures";

vi.mock("@/services/analytics/analytics-service", () => ({
  getDashboardOverview: vi.fn().mockResolvedValue({
    riskLevel: "medium",
    riskScore: 65,
    openRecommendations: 3,
  }),
  getWasteAnalytics: vi.fn().mockResolvedValue({
    totalWasteMeals: 100,
    summary: [],
    rootCause: { drivers: [{ name: "Expiration", percent: 40, description: "Top driver" }], confidence: 0.8, summary: "Expiration leads" },
  }),
  getInventoryAnalytics: vi.fn().mockResolvedValue({ summary: [] }),
  getAttendanceAnalytics: vi.fn().mockResolvedValue({ summary: [] }),
  getDonationAnalytics: vi.fn().mockResolvedValue({ mealsRescued: 50, summary: [] }),
  getImpactAnalytics: vi.fn().mockResolvedValue({ summary: [{ id: "meals-saved", value: 500 }] }),
}));

vi.mock("@/services/forecast/forecast-service", () => ({
  listForecasts: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/services/recommendation/recommendation-service", () => ({
  listRecommendations: vi.fn().mockResolvedValue([]),
}));

import { collectReportData } from "@/services/report/report-data-service";

describe("report-data-service", () => {
  it("collectReportData aggregates analytics for waste report", async () => {
    const data = await collectReportData({
      organizationId: DEMO_ORG_ID,
      siteId: DEMO_SITE_ID,
      siteName: "Main Site",
      template: "waste_report",
      dateRange: { preset: "month", start: "2026-01-01", end: "2026-06-01" },
    });
    expect(data.title).toBeDefined();
    expect(data.sections.length).toBeGreaterThan(0);
    expect(data.metrics.some((m) => m.label === "Risk Level")).toBe(true);
  });
});
