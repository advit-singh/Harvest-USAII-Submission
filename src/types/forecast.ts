/** API_SPEC §27–29 forecasts */

export type ForecastType = "surplus" | "waste" | "demand";

export interface ForecastSummary {
  id: string;
  forecastType: ForecastType;
  siteId: string;
  siteName: string;
  predictedMeals: number;
  predictedInventoryUnits: number;
  confidence: number;
  forecastWindowDays: number;
  generatedAt: string;
  trend: "up" | "down" | "stable";
  historyPoints: { date: string; value: number }[];
}

export interface ForecastListResponse {
  forecasts: ForecastSummary[];
}
