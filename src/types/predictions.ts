/** Predictions workspace types — FRONTEND_SPEC §31–38 */

export type PredictionsTabId =
  | "summary"
  | "explorer"
  | "recommendations"
  | "simulator";

export type PredictionsTimeRange = "week" | "month" | "quarter";

export interface PredictionsFilters {
  timeRange: PredictionsTimeRange;
  siteId: string | null;
  category: string | null;
  itemId: string | null;
  forecastType: string | null;
}

export interface ForecastSummaryKpis {
  predictedSurplusMeals: number;
  predictedWasteMeals: number;
  expirationRiskItems: number;
  attendanceForecast: number;
  purchasingForecast: number;
  confidence: number;
  forecastWindowDays: number;
  siteName: string;
}
