import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { donation_events, impact_metrics } from "@/db/schema";
import type { ImpactTimeRange } from "@/types/impact";
import { computeImpactDelta } from "./impact-formulas";
import {
  emptyAggregatedMetrics,
  mapAnalyticsImpact,
  mapImpactMetrics,
  type AggregatedMetrics,
} from "./impact-mappers";
import type {
  GetImpactMetricsInput,
  RecordImpactDeltaInput,
  TimeRangeBounds,
} from "./impact-types";

const METRIC_ROWS: Array<{
  key: keyof AggregatedMetrics;
  type: string;
  scale?: number;
}> = [
  { key: "mealsSaved", type: "meals_saved" },
  { key: "foodDivertedKg", type: "food_diverted" },
  { key: "co2AvoidedKg", type: "co2_avoided" },
  { key: "moneySaved", type: "money_saved" },
  { key: "waterSavedLiters", type: "water_saved" },
  { key: "peopleServed", type: "people_served" },
];

export function resolveTimeRangeBounds(timeRange: ImpactTimeRange): TimeRangeBounds {
  const end = new Date();
  const start = new Date();
  const labels: Record<ImpactTimeRange, string> = {
    week: "Last 7 days",
    month: "Last 30 days",
    quarter: "Last 90 days",
    year: "Last 365 days",
  };
  const days: Record<ImpactTimeRange, number> = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
  };
  start.setDate(start.getDate() - days[timeRange]);
  return { start, end, label: labels[timeRange] };
}

export async function getImpactMetrics(input: GetImpactMetricsInput) {
  const bounds = resolveTimeRangeBounds(input.timeRange);
  const aggregated = await aggregateImpactMetrics(
    input.organizationId,
    bounds.start,
    bounds.end,
    input.siteId,
  );
  return mapImpactMetrics(aggregated, input.timeRange, bounds);
}

export async function getAnalyticsImpact(
  organizationId: string,
  timeRange: ImpactTimeRange,
  siteId?: string,
) {
  const bounds = resolveTimeRangeBounds(timeRange);
  const [aggregated, series] = await Promise.all([
    aggregateImpactMetrics(organizationId, bounds.start, bounds.end, siteId),
    buildImpactTimeSeries(organizationId, bounds.start, bounds.end, siteId),
  ]);
  return mapAnalyticsImpact(aggregated, series);
}

export async function recordImpactDelta(input: RecordImpactDeltaInput): Promise<void> {
  const now = new Date();
  const entries: Array<{ type: string; value: number }> = [
    { type: "meals_saved", value: input.delta.mealsSaved },
    { type: "food_diverted", value: input.delta.foodDivertedKg },
    { type: "co2_avoided", value: input.delta.co2AvoidedKg },
    { type: "money_saved", value: input.delta.moneySaved },
    {
      type: "water_saved",
      value: input.delta.waterSavedLiters ?? input.delta.foodDivertedKg * 50,
    },
    {
      type: "people_served",
      value: input.delta.peopleServed ?? input.delta.mealsSaved,
    },
  ];

  await db.insert(impact_metrics).values(
    entries.map((entry) => ({
      organization_id: input.organizationId,
      metric_type: entry.type,
      metric_value: String(entry.value),
      calculation_date: now,
      created_by: input.createdBy,
    })),
  );
}

export async function recomputeImpactSnapshot(
  organizationId: string,
  siteId?: string,
): Promise<void> {
  const bounds = resolveTimeRangeBounds("month");
  const fromEvents = await aggregateFromDonationEvents(
    organizationId,
    bounds.start,
    bounds.end,
    siteId,
  );
  if (fromEvents.mealsSaved === 0) return;

  const existing = await aggregateImpactMetrics(
    organizationId,
    bounds.start,
    bounds.end,
    siteId,
  );
  if (existing.mealsSaved >= fromEvents.mealsSaved) return;

  const delta = computeImpactDelta({ quantityKg: fromEvents.foodDivertedKg });
  await recordImpactDelta({ organizationId, delta });
}

async function aggregateImpactMetrics(
  organizationId: string,
  start: Date,
  end: Date,
  siteId?: string,
): Promise<AggregatedMetrics> {
  const [fromMetrics, fromEvents] = await Promise.all([
    aggregateFromImpactTable(organizationId, start, end),
    aggregateFromDonationEvents(organizationId, start, end, siteId),
  ]);

  return {
    mealsSaved: Math.max(fromMetrics.mealsSaved, fromEvents.mealsSaved),
    foodDivertedKg: Math.max(fromMetrics.foodDivertedKg, fromEvents.foodDivertedKg),
    moneySaved: Math.max(fromMetrics.moneySaved, fromEvents.moneySaved),
    co2AvoidedKg: Math.max(fromMetrics.co2AvoidedKg, fromEvents.co2AvoidedKg),
    waterSavedLiters: Math.max(fromMetrics.waterSavedLiters, fromEvents.waterSavedLiters),
    peopleServed: Math.max(fromMetrics.peopleServed, fromEvents.peopleServed),
  };
}

async function aggregateFromImpactTable(
  organizationId: string,
  start: Date,
  end: Date,
): Promise<AggregatedMetrics> {
  const rows = await db
    .select({
      metricType: impact_metrics.metric_type,
      total: sql<string>`COALESCE(SUM(${impact_metrics.metric_value}::numeric), 0)`,
    })
    .from(impact_metrics)
    .where(
      and(
        eq(impact_metrics.organization_id, organizationId),
        gte(impact_metrics.calculation_date, start),
        lte(impact_metrics.calculation_date, end),
      ),
    )
    .groupBy(impact_metrics.metric_type);

  const result = emptyAggregatedMetrics();
  for (const row of rows) {
    const value = Number.parseFloat(row.total) || 0;
    const mapping = METRIC_ROWS.find((m) => m.type === row.metricType);
    if (mapping) result[mapping.key] = value;
  }
  return result;
}

async function aggregateFromDonationEvents(
  organizationId: string,
  start: Date,
  end: Date,
  siteId?: string,
): Promise<AggregatedMetrics> {
  const conditions = [
    eq(donation_events.organization_id, organizationId),
    gte(donation_events.completed_at, start),
    lte(donation_events.completed_at, end),
  ];
  if (siteId) conditions.push(eq(donation_events.site_id, siteId));

  const rows = await db
    .select({
      meals: sql<string>`COALESCE(SUM(${donation_events.estimated_meals}), 0)`,
      quantity: sql<string>`COALESCE(SUM(${donation_events.total_quantity}::numeric), 0)`,
    })
    .from(donation_events)
    .where(and(...conditions));

  const meals = Number.parseInt(rows[0]?.meals ?? "0", 10) || 0;
  const quantityKg = Number.parseFloat(rows[0]?.quantity ?? "0") || 0;
  const delta = computeImpactDelta({
    quantityKg: quantityKg > 0 ? quantityKg : meals * 0.4,
    mealsOverride: meals > 0 ? meals : undefined,
  });

  return {
    mealsSaved: delta.mealsSaved,
    foodDivertedKg: delta.foodDivertedKg,
    moneySaved: delta.moneySaved,
    co2AvoidedKg: delta.co2AvoidedKg,
    waterSavedLiters: delta.waterSavedLiters,
    peopleServed: delta.peopleServed,
  };
}

async function buildImpactTimeSeries(
  organizationId: string,
  start: Date,
  end: Date,
  siteId?: string,
) {
  const conditions = [
    eq(donation_events.organization_id, organizationId),
    gte(donation_events.completed_at, start),
    lte(donation_events.completed_at, end),
  ];
  if (siteId) conditions.push(eq(donation_events.site_id, siteId));

  const rows = await db
    .select({
      day: sql<string>`DATE(${donation_events.completed_at})`,
      meals: sql<string>`COALESCE(SUM(${donation_events.estimated_meals}), 0)`,
      quantity: sql<string>`COALESCE(SUM(${donation_events.total_quantity}::numeric), 0)`,
    })
    .from(donation_events)
    .where(and(...conditions))
    .groupBy(sql`DATE(${donation_events.completed_at})`)
    .orderBy(sql`DATE(${donation_events.completed_at})`);

  return rows.map((row) => {
    const meals = Number.parseInt(row.meals, 10) || 0;
    const qty = Number.parseFloat(row.quantity) || meals * 0.4;
    const delta = computeImpactDelta({ quantityKg: qty, mealsOverride: meals || undefined });
    return {
      date: row.day,
      meals: delta.mealsSaved,
      co2: delta.co2AvoidedKg,
      money: delta.moneySaved,
    };
  });
}
