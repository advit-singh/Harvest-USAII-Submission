/** API_SPEC §40 impact metrics */

export type ImpactTimeRange = "week" | "month" | "quarter" | "year";

export interface ImpactMetrics {
  timeRange: ImpactTimeRange;
  mealsSaved: number;
  foodDivertedKg: number;
  moneySaved: number;
  co2AvoidedKg: number;
  periodLabel: string;
}
