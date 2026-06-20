import { describe, expect, it } from "vitest";
import { mapForecastSummary, mapForecastSummaryKpis } from "@/services/forecast/forecast-mappers";

describe("forecast-mappers", () => {
  it("maps forecast summary with API confidence scale", () => {
    const summary = mapForecastSummary(
      {
        id: "fcst-1",
        organization_id: "org-1",
        site_id: "site-1",
        forecast_type: "surplus",
        forecast_date: new Date("2026-06-01"),
        prediction_window: 7,
        predicted_value: "142",
        confidence_score: 87,
        explanation: "test",
        created_at: new Date("2026-06-01"),
        updated_at: new Date("2026-06-01"),
        created_by: null,
      },
      "Main Kitchen",
      [{ date: "2026-06-01", value: 10 }],
      "up",
    );

    expect(summary.confidence).toBe(0.87);
    expect(summary.siteName).toBe("Main Kitchen");
    expect(summary.predictedMeals).toBeGreaterThan(0);
  });

  it("maps summary KPIs from latest forecasts", () => {
    const row = {
      id: "fcst-1",
      organization_id: "org-1",
      site_id: "site-1",
      forecast_type: "surplus",
      forecast_date: new Date(),
      prediction_window: 7,
      predicted_value: "100",
      confidence_score: 80,
      explanation: null,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: null,
    };

    const kpis = mapForecastSummaryKpis({
      siteName: "Main Kitchen",
      windowDays: 7,
      surplusForecast: row,
      wasteForecast: { ...row, predicted_value: "40", forecast_type: "waste" },
      demandForecast: { ...row, predicted_value: "300", forecast_type: "demand" },
      expirationRiskItems: 8,
    });

    expect(kpis.predictedSurplusMeals).toBe(100);
    expect(kpis.predictedWasteMeals).toBe(40);
    expect(kpis.expirationRiskItems).toBe(8);
    expect(kpis.confidence).toBeCloseTo(0.8, 1);
  });
});
