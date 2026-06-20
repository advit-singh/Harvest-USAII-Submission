import type { ForecastDetail, ForecastSummary } from "@/types/forecast";
import type { ForecastSummaryKpis } from "@/types/predictions";
import { toApiConfidence, toDbConfidence } from "@/lib/api/confidence";
import type { forecasts } from "@/db/schema";

type ForecastRow = typeof forecasts.$inferSelect;

export function mapForecastSummary(
  row: ForecastRow,
  siteName: string,
  historyPoints: Array<{ date: string; value: number }> = [],
  trend: "up" | "down" | "stable" = "stable",
): ForecastSummary {
  const predicted = Number(row.predicted_value);
  return {
    id: row.id,
    forecastType: row.forecast_type as ForecastSummary["forecastType"],
    siteId: row.site_id,
    siteName,
    predictedMeals: row.forecast_type === "demand" ? predicted : Math.round(predicted * 0.6),
    predictedInventoryUnits: row.forecast_type === "surplus" ? predicted : Math.round(predicted * 0.3),
    confidence: toApiConfidence(row.confidence_score),
    forecastWindowDays: row.prediction_window,
    generatedAt: row.created_at.toISOString(),
    trend,
    historyPoints,
  };
}

export function mapForecastDetail(
  row: ForecastRow,
  siteName: string,
  factors: Array<{ name: string; impactWeight: number; description: string }>,
  linkedRecommendationIds: string[],
  extras: {
    predictedWasteMeals: number;
    expirationRiskItems: number;
    attendanceForecast: number;
    purchasingForecast: number;
    historyPoints: Array<{ date: string; value: number }>;
    trend: "up" | "down" | "stable";
  },
): ForecastDetail {
  return {
    ...mapForecastSummary(row, siteName, extras.historyPoints, extras.trend),
    factors,
    predictedWasteMeals: extras.predictedWasteMeals,
    expirationRiskItems: extras.expirationRiskItems,
    attendanceForecast: extras.attendanceForecast,
    purchasingForecast: extras.purchasingForecast,
    linkedRecommendationIds,
  };
}

export function mapForecastSummaryKpis(input: {
  siteName: string;
  windowDays: number;
  surplusForecast: ForecastRow | null;
  wasteForecast: ForecastRow | null;
  demandForecast: ForecastRow | null;
  expirationRiskItems: number;
}): ForecastSummaryKpis {
  const confidences = [input.surplusForecast, input.wasteForecast, input.demandForecast]
    .filter(Boolean)
    .map((row) => toApiConfidence(row!.confidence_score));
  const avgConfidence =
    confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;

  return {
    predictedSurplusMeals: Number(input.surplusForecast?.predicted_value ?? 0),
    predictedWasteMeals: Number(input.wasteForecast?.predicted_value ?? 0),
    expirationRiskItems: input.expirationRiskItems,
    attendanceForecast: Number(input.demandForecast?.predicted_value ?? 0),
    purchasingForecast: Math.round(Number(input.demandForecast?.predicted_value ?? 0) * 4.5),
    confidence: avgConfidence,
    forecastWindowDays: input.windowDays,
    siteName: input.siteName,
  };
}

export function dbConfidenceFromComputation(confidence: number): number {
  return toDbConfidence(confidence);
}
