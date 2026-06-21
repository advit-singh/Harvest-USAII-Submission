import type { AnalyticsFilters, AnalyticsTimeRange } from "@/types/analytics";
import type { ImpactTimeRange } from "@/types/impact";

export interface DateBounds {
  start: Date;
  end: Date;
}

export function parseAnalyticsFilters(searchParams: URLSearchParams): AnalyticsFilters {
  const timeRange = (searchParams.get("timeRange") ?? "month") as AnalyticsTimeRange;
  return {
    timeRange,
    siteId: searchParams.get("siteId"),
    hierarchyLevel: (searchParams.get("hierarchyLevel") ?? "organization") as AnalyticsFilters["hierarchyLevel"],
    hierarchyId: searchParams.get("hierarchyId"),
    category: searchParams.get("category"),
    eventId: searchParams.get("eventId"),
  };
}

export function timeRangeToBounds(timeRange: AnalyticsTimeRange | ImpactTimeRange): DateBounds {
  const end = new Date();
  const start = new Date();
  const days: Record<string, number> = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
  };
  start.setDate(start.getDate() - (days[timeRange] ?? 30));
  return { start, end };
}

export function percentOf(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

export function buildDailySeries(
  rows: Array<{ date: string; value: number }>,
  start: Date,
  end: Date,
): Array<{ date: string; value: number }> {
  const map = new Map(rows.map((r) => [r.date, r.value]));
  const series: Array<{ date: string; value: number }> = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    series.push({ date: key, value: map.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
}
