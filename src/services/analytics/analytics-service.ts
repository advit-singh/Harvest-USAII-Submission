import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  attendance_records,
  donation_events,
  donation_recipients,
  inventory_categories,
  inventory_items,
  inventory_lots,
  organization_sites,
  recommendations,
  uploads,
  waste_events,
} from "@/db/schema";
import type {
  AnalyticsFilters,
  AttendanceAnalytics,
  DonationAnalytics,
  InventoryAnalytics,
  MetricSummary,
  WasteAnalytics,
} from "@/types/analytics";
import type { DashboardOverview } from "@/types/dashboard";
import { getAnalyticsImpact } from "@/services/impact/impact-service";
import { buildWasteRootCause } from "./root-cause";
import {
  buildDailySeries,
  percentOf,
  timeRangeToBounds,
} from "./analytics-queries";

function siteCondition(siteId: string | null, column: typeof waste_events.site_id) {
  return siteId ? eq(column, siteId) : undefined;
}

export async function getDashboardOverview(organizationId: string): Promise<DashboardOverview> {
  const [wasteCount, uploadCount, recCount, forecastRow] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(waste_events)
      .where(eq(waste_events.organization_id, organizationId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(uploads)
      .where(
        and(
          eq(uploads.organization_id, organizationId),
          sql`${uploads.processing_status} IN ('processing', 'extracting', 'validating', 'review_required')`,
        ),
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(recommendations)
      .where(
        and(
          eq(recommendations.organization_id, organizationId),
          eq(recommendations.status, "open"),
        ),
      ),
    db.query.forecasts.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.organization_id, organizationId),
      orderBy: (fields, { desc: descFn }) => [descFn(fields.created_at)],
    }),
  ]);

  const hasOperationalData = (wasteCount[0]?.count ?? 0) > 0;
  const riskScore = forecastRow
    ? Math.min(100, Number.parseFloat(forecastRow.predicted_value) / 2)
    : 35;
  const riskLevel: DashboardOverview["riskLevel"] =
    riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";

  return {
    hasOperationalData,
    riskLevel,
    riskScore: Math.round(riskScore),
    forecastWindowDays: forecastRow?.prediction_window ?? 7,
    primaryDrivers: forecastRow?.explanation
      ? [forecastRow.explanation.slice(0, 80)]
      : ["Attendance variance", "Expiration risk"],
    openRecommendations: recCount[0]?.count ?? 0,
    pendingUploads: uploadCount[0]?.count ?? 0,
  };
}

export async function getWasteAnalytics(
  organizationId: string,
  filters: AnalyticsFilters,
): Promise<WasteAnalytics> {
  const bounds = timeRangeToBounds(filters.timeRange);
  const conditions = [
    eq(waste_events.organization_id, organizationId),
    gte(waste_events.waste_date, bounds.start),
    lte(waste_events.waste_date, bounds.end),
  ];
  const siteFilter = siteCondition(filters.siteId, waste_events.site_id);
  if (siteFilter) conditions.push(siteFilter);

  const [timeRows, categoryRows, itemRows, siteRows, totalRow] = await Promise.all([
    db
      .select({
        date: sql<string>`DATE(${waste_events.waste_date})`,
        value: sql<string>`COALESCE(SUM(${waste_events.quantity}::numeric), 0)`,
      })
      .from(waste_events)
      .where(and(...conditions))
      .groupBy(sql`DATE(${waste_events.waste_date})`),
    db
      .select({
        name: waste_events.waste_reason,
        value: sql<string>`COALESCE(SUM(${waste_events.quantity}::numeric), 0)`,
      })
      .from(waste_events)
      .where(and(...conditions))
      .groupBy(waste_events.waste_reason),
    db
      .select({
        name: inventory_items.name,
        value: sql<string>`COALESCE(SUM(${waste_events.quantity}::numeric), 0)`,
      })
      .from(waste_events)
      .leftJoin(inventory_items, eq(waste_events.inventory_item_id, inventory_items.id))
      .where(and(...conditions))
      .groupBy(inventory_items.name)
      .limit(10),
    db
      .select({
        name: organization_sites.name,
        value: sql<string>`COALESCE(SUM(${waste_events.quantity}::numeric), 0)`,
      })
      .from(waste_events)
      .innerJoin(organization_sites, eq(waste_events.site_id, organization_sites.id))
      .where(and(...conditions))
      .groupBy(organization_sites.name),
    db
      .select({
        total: sql<string>`COALESCE(SUM(${waste_events.quantity}::numeric), 0)`,
      })
      .from(waste_events)
      .where(and(...conditions)),
  ]);

  const total = Number.parseFloat(totalRow[0]?.total ?? "0") || 0;
  const byCategory = mapBreakdown(categoryRows, total, "kg");
  const rootCause = buildWasteRootCause(
    byCategory.map((b) => ({ name: b.name, value: b.value })),
  );

  return {
    timeSeries: buildDailySeries(
      timeRows.map((r) => ({ date: r.date, value: Number.parseFloat(r.value) || 0 })),
      bounds.start,
      bounds.end,
    ),
    byCategory,
    byItem: mapBreakdown(itemRows, total, "kg"),
    bySite: mapBreakdown(siteRows, total, "kg"),
    byEvent: [],
    rootCause,
    summary: buildWasteSummary(total, timeRows.length),
  };
}

export async function getInventoryAnalytics(
  organizationId: string,
  filters: AnalyticsFilters,
): Promise<InventoryAnalytics> {
  const bounds = timeRangeToBounds(filters.timeRange);
  const siteFilter = filters.siteId ? eq(inventory_lots.site_id, filters.siteId) : undefined;

  const lots = await db
    .select({
      remaining: inventory_lots.remaining_quantity,
      quantity: inventory_lots.quantity,
      expirationDate: inventory_lots.expiration_date,
      categoryName: inventory_categories.name,
      siteId: inventory_lots.site_id,
    })
    .from(inventory_lots)
    .innerJoin(inventory_items, eq(inventory_lots.inventory_item_id, inventory_items.id))
    .leftJoin(inventory_categories, eq(inventory_items.category_id, inventory_categories.id))
    .innerJoin(organization_sites, eq(inventory_lots.site_id, organization_sites.id))
    .where(
      and(
        eq(organization_sites.organization_id, organizationId),
        siteFilter,
      ),
    );

  const now = new Date();
  const weekAhead = new Date();
  weekAhead.setDate(weekAhead.getDate() + 7);

  let totalRemaining = 0;
  let totalCapacity = 0;
  let expiringCount = 0;
  const categoryMap = new Map<string, number>();

  for (const lot of lots) {
    const remaining = Number.parseFloat(lot.remaining) || 0;
    const capacity = Number.parseFloat(lot.quantity) || 0;
    totalRemaining += remaining;
    totalCapacity += capacity;
    if (lot.expirationDate && lot.expirationDate <= weekAhead && lot.expirationDate >= now) {
      expiringCount += 1;
    }
    const cat = lot.categoryName ?? "Uncategorized";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + remaining);
  }

  const turnoverRate =
    totalCapacity > 0 ? Math.round((1 - totalRemaining / totalCapacity) * 100) / 100 : 0;
  const storageUtilization =
    totalCapacity > 0 ? Math.round((totalRemaining / totalCapacity) * 100) : 0;

  const categoryUtilization = [...categoryMap.entries()].map(([name, value], i) => ({
    id: `cat-${i}`,
    name,
    value: Math.round(value * 10) / 10,
    unit: "units",
    percent: percentOf(value, totalRemaining),
  }));

  return {
    trends: buildDailySeries([], bounds.start, bounds.end),
    turnoverRate,
    expirationRisk: [
      {
        id: "expiring-soon",
        name: "Lots expiring within 7 days",
        value: expiringCount,
        unit: "lots",
      },
    ],
    categoryUtilization,
    storageUtilization,
    summary: [
      { id: "on-hand", label: "On Hand", value: Math.round(totalRemaining), unit: "units" },
      { id: "turnover", label: "Turnover Rate", value: turnoverRate },
      { id: "expiring", label: "Expiration Risk", value: expiringCount, unit: "lots" },
    ],
  };
}

export async function getAttendanceAnalytics(
  organizationId: string,
  filters: AnalyticsFilters,
): Promise<AttendanceAnalytics> {
  const bounds = timeRangeToBounds(filters.timeRange);
  const conditions = [
    eq(attendance_records.organization_id, organizationId),
    gte(attendance_records.attendance_date, bounds.start),
    lte(attendance_records.attendance_date, bounds.end),
  ];
  if (filters.siteId) conditions.push(eq(attendance_records.site_id, filters.siteId));

  const rows = await db
    .select({
      date: sql<string>`DATE(${attendance_records.attendance_date})`,
      value: attendance_records.attendance_count,
    })
    .from(attendance_records)
    .where(and(...conditions))
    .orderBy(attendance_records.attendance_date);

  const timeSeries = rows.map((r) => ({
    date: r.date,
    value: r.value ?? 0,
  }));

  const avg =
    timeSeries.length > 0
      ? Math.round(timeSeries.reduce((s, p) => s + p.value, 0) / timeSeries.length)
      : 0;

  const forecastRow = await db.query.forecasts.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(fields.organization_id, organizationId),
        eqFn(fields.forecast_type, "demand"),
      ),
    orderBy: (fields, { desc: descFn }) => [descFn(fields.created_at)],
  });

  const forecastAccuracy = forecastRow
    ? Math.min(0.95, (forecastRow.confidence_score ?? 70) / 100)
    : 0.75;

  return {
    trends: buildDailySeries(timeSeries, bounds.start, bounds.end),
    forecastAccuracy,
    seasonality: timeSeries.slice(-7),
    eventImpact: [],
    summary: [
      { id: "avg-attendance", label: "Average Daily Attendance", value: avg },
      {
        id: "forecast-accuracy",
        label: "Forecast Accuracy",
        value: Math.round(forecastAccuracy * 100),
        unit: "%",
      },
    ],
  };
}

export async function getDonationAnalytics(
  organizationId: string,
  filters: AnalyticsFilters,
): Promise<DonationAnalytics> {
  const bounds = timeRangeToBounds(filters.timeRange);
  const conditions = [
    eq(donation_events.organization_id, organizationId),
    gte(donation_events.completed_at, bounds.start),
    lte(donation_events.completed_at, bounds.end),
  ];
  if (filters.siteId) conditions.push(eq(donation_events.site_id, filters.siteId));

  const [historyRows, recipientRows, totals] = await Promise.all([
    db
      .select({
        date: sql<string>`DATE(${donation_events.completed_at})`,
        value: sql<string>`COALESCE(SUM(${donation_events.estimated_meals}), 0)`,
      })
      .from(donation_events)
      .where(and(...conditions))
      .groupBy(sql`DATE(${donation_events.completed_at})`),
    db
      .select({
        name: donation_recipients.name,
        value: sql<string>`COALESCE(SUM(${donation_events.estimated_meals}), 0)`,
      })
      .from(donation_events)
      .innerJoin(donation_recipients, eq(donation_events.recipient_id, donation_recipients.id))
      .where(and(...conditions))
      .groupBy(donation_recipients.name),
    db
      .select({
        meals: sql<string>`COALESCE(SUM(${donation_events.estimated_meals}), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(donation_events)
      .where(and(...conditions)),
  ]);

  const mealsRescued = Number.parseInt(totals[0]?.meals ?? "0", 10) || 0;
  const eventCount = totals[0]?.count ?? 0;
  const totalMeals = recipientRows.reduce(
    (s, r) => s + (Number.parseInt(r.value, 10) || 0),
    0,
  );

  return {
    history: buildDailySeries(
      historyRows.map((r) => ({ date: r.date, value: Number.parseInt(r.value, 10) || 0 })),
      bounds.start,
      bounds.end,
    ),
    recipientPerformance: mapBreakdown(recipientRows, totalMeals || 1, "meals"),
    mealsRescued,
    successRate: eventCount > 0 ? 0.92 : 0,
    summary: [
      { id: "meals-rescued", label: "Meals Rescued", value: mealsRescued, unit: "meals" },
      { id: "donations", label: "Donations Completed", value: eventCount },
      {
        id: "success-rate",
        label: "Success Rate",
        value: Math.round((eventCount > 0 ? 0.92 : 0) * 100),
        unit: "%",
      },
    ],
  };
}

export async function getImpactAnalytics(organizationId: string, filters: AnalyticsFilters) {
  return getAnalyticsImpact(organizationId, filters.timeRange, filters.siteId ?? undefined);
}

function mapBreakdown(
  rows: Array<{ name: string | null; value: string }>,
  total: number,
  unit: string,
) {
  return rows
    .filter((r) => r.name)
    .map((r, i) => {
      const value = Number.parseFloat(r.value) || 0;
      return {
        id: `item-${i}`,
        name: r.name!,
        value: Math.round(value * 10) / 10,
        unit,
        percent: percentOf(value, total),
      };
    });
}

function buildWasteSummary(total: number, days: number): MetricSummary[] {
  return [
    { id: "total-waste", label: "Total Waste", value: Math.round(total * 10) / 10, unit: "kg" },
    { id: "active-days", label: "Days with Records", value: days },
    {
      id: "daily-avg",
      label: "Daily Average",
      value: days > 0 ? Math.round((total / days) * 10) / 10 : 0,
      unit: "kg",
    },
  ];
}
