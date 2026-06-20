import { describe, expect, it } from "vitest";
import { computeForecast } from "@/services/forecast/forecast-models";
import type { OperationalSnapshot } from "@/services/intelligence/intelligence-types";
import { EMPTY_EXTERNAL_DATA } from "@/services/intelligence/intelligence-types";

function buildSnapshot(overrides: Partial<OperationalSnapshot> = {}): OperationalSnapshot {
  return {
    organizationId: "org-1",
    siteId: "site-1",
    windowDays: 7,
    wasteMeals: [3, 4, 5, 3, 4],
    attendance: [300, 310, 295, 305, 300],
    expirationRiskItems: 5,
    upcomingEvents: [{ name: "Exam Week", expectedAttendance: 280, startDate: new Date() }],
    inventoryUnits: 120,
    purchaseSpend: 2000,
    avgWastePerDay: 3.8,
    avgAttendance: 302,
    wasteTrend: 5,
    attendanceTrend: -2,
    externalData: { ...EMPTY_EXTERNAL_DATA },
    ...overrides,
  };
}

describe("forecast-models", () => {
  it("computes surplus forecast with confidence and factors", () => {
    const result = computeForecast("surplus", buildSnapshot(), 7);
    expect(result.predictedValue).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.4);
    expect(result.factors.length).toBeGreaterThan(0);
    expect(result.historyPoints.length).toBeGreaterThan(0);
  });

  it("computes waste forecast from historical waste", () => {
    const result = computeForecast("waste", buildSnapshot(), 7);
    expect(result.predictedValue).toBeGreaterThan(0);
    expect(result.predictedWasteMeals).toBe(result.predictedValue);
  });

  it("handles empty history with conservative defaults", () => {
    const result = computeForecast(
      "surplus",
      buildSnapshot({
        wasteMeals: [],
        attendance: [],
        inventoryUnits: 0,
        upcomingEvents: [],
        expirationRiskItems: 0,
        wasteTrend: 0,
        attendanceTrend: 0,
        avgWastePerDay: 0,
        avgAttendance: 0,
      }),
      7,
    );
    expect(result.factors.some((f) => f.name === "Limited History")).toBe(true);
    expect(result.confidence).toBeLessThanOrEqual(0.95);
  });
});
