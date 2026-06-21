import type { ImpactMetrics } from "@/types/impact";
import type { AnalyticsImpact, ImpactMetricGroup, MetricSummary } from "@/types/analytics";
import type { TimeRangeBounds } from "./impact-types";

interface AggregatedMetrics {
  mealsSaved: number;
  foodDivertedKg: number;
  moneySaved: number;
  co2AvoidedKg: number;
  waterSavedLiters: number;
  peopleServed: number;
}

export function mapImpactMetrics(
  aggregated: AggregatedMetrics,
  timeRange: ImpactMetrics["timeRange"],
  bounds: TimeRangeBounds,
): ImpactMetrics {
  return {
    timeRange,
    mealsSaved: Math.round(aggregated.mealsSaved),
    foodDivertedKg: Math.round(aggregated.foodDivertedKg * 10) / 10,
    moneySaved: Math.round(aggregated.moneySaved),
    co2AvoidedKg: Math.round(aggregated.co2AvoidedKg * 10) / 10,
    periodLabel: bounds.label,
  };
}

function metricGroup(
  label: string,
  metrics: MetricSummary[],
  timeSeries: { date: string; value: number }[],
): ImpactMetricGroup {
  return { label, metrics, timeSeries };
}

export function mapAnalyticsImpact(
  aggregated: AggregatedMetrics,
  timeSeries: { date: string; meals: number; co2: number; money: number }[],
): AnalyticsImpact {
  const mealsSeries = timeSeries.map((p) => ({ date: p.date, value: p.meals }));
  const co2Series = timeSeries.map((p) => ({ date: p.date, value: p.co2 }));
  const moneySeries = timeSeries.map((p) => ({ date: p.date, value: p.money }));

  return {
    environmental: metricGroup("Environmental", [
      { id: "food-diverted", label: "Food Diverted", value: aggregated.foodDivertedKg, unit: "kg" },
      { id: "co2-avoided", label: "CO₂ Avoided", value: aggregated.co2AvoidedKg, unit: "kg" },
      { id: "water-saved", label: "Water Saved", value: aggregated.waterSavedLiters, unit: "L" },
    ], co2Series),
    financial: metricGroup("Financial", [
      { id: "money-saved", label: "Money Saved", value: aggregated.moneySaved, unit: "USD" },
    ], moneySeries),
    community: metricGroup("Community", [
      { id: "meals-saved", label: "Meals Rescued", value: aggregated.mealsSaved, unit: "meals" },
      { id: "people-served", label: "People Served", value: aggregated.peopleServed, unit: "people" },
    ], mealsSeries),
    summary: [
      { id: "total-meals", label: "Total Meals Rescued", value: aggregated.mealsSaved, unit: "meals" },
      { id: "total-co2", label: "CO₂ Avoided", value: aggregated.co2AvoidedKg, unit: "kg" },
      { id: "total-savings", label: "Financial Impact", value: aggregated.moneySaved, unit: "USD" },
    ],
  };
}

export function emptyAggregatedMetrics(): AggregatedMetrics {
  return {
    mealsSaved: 0,
    foodDivertedKg: 0,
    moneySaved: 0,
    co2AvoidedKg: 0,
    waterSavedLiters: 0,
    peopleServed: 0,
  };
}

export type { AggregatedMetrics };
