import { describe, expect, it } from "vitest";
import { detectRecommendations } from "@/services/recommendation/recommendation-engine";
import { computeForecast } from "@/services/forecast/forecast-models";
import type { OperationalSnapshot } from "@/services/intelligence/intelligence-types";
import { EMPTY_EXTERNAL_DATA } from "@/services/intelligence/intelligence-types";

const snapshot: OperationalSnapshot = {
  organizationId: "org-1",
  siteId: "site-1",
  windowDays: 7,
  wasteMeals: [5, 6, 7, 8, 9],
  attendance: [280, 275, 270, 265, 260],
  expirationRiskItems: 10,
  upcomingEvents: [],
  inventoryUnits: 200,
  purchaseSpend: 3000,
  avgWastePerDay: 7,
  avgAttendance: 270,
  wasteTrend: 15,
  attendanceTrend: -12,
  externalData: { ...EMPTY_EXTERNAL_DATA },
};

describe("recommendation-engine", () => {
  it("detects production and inventory recommendations for high surplus", () => {
    const computation = computeForecast("surplus", snapshot, 7);
    const drafts = detectRecommendations(
      { ...computation, predictedSurplusMeals: 60 },
      snapshot,
    );

    expect(drafts.length).toBeGreaterThan(0);
    expect(drafts.some((d) => d.recommendationType === "production")).toBe(true);
    expect(drafts.some((d) => d.recommendationType === "inventory")).toBe(true);
  });

  it("returns monitoring recommendation when no risks detected", () => {
    const computation = computeForecast(
      "surplus",
      {
        ...snapshot,
        expirationRiskItems: 0,
        wasteMeals: [],
        attendance: [300],
        wasteTrend: 0,
        attendanceTrend: 0,
      },
      7,
    );
    const drafts = detectRecommendations(
      { ...computation, predictedSurplusMeals: 5, predictedWasteMeals: 5 },
      { ...snapshot, expirationRiskItems: 0, attendanceTrend: 0, wasteTrend: 0 },
    );

    expect(drafts.some((d) => d.recommendationType === "operations")).toBe(true);
  });
});
