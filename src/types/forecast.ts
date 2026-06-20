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

export interface ForecastFactor {
  name: string;
  impactWeight: number;
  description: string;
}

export interface ForecastDetail extends ForecastSummary {
  factors: ForecastFactor[];
  predictedWasteMeals: number;
  expirationRiskItems: number;
  attendanceForecast: number;
  purchasingForecast: number;
  linkedRecommendationIds: string[];
}

export interface GenerateForecastInput {
  forecastType: ForecastType;
  siteId: string;
  days: number;
}

export interface GenerateForecastResponse {
  forecastId: string;
}
