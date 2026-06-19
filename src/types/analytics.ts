/** API_SPEC §26 analytics endpoints */

export type AnalyticsTimeRange = "week" | "month" | "quarter" | "year";

export type AnalyticsTabId =
  | "waste"
  | "inventory"
  | "attendance"
  | "donations"
  | "impact";

export type HierarchyLevel =
  | "organization"
  | "region"
  | "campus"
  | "building"
  | "kitchen"
  | "storage";

export interface AnalyticsFilters {
  timeRange: AnalyticsTimeRange;
  siteId: string | null;
  hierarchyLevel: HierarchyLevel;
  hierarchyId: string | null;
  category: string | null;
  eventId: string | null;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface BreakdownItem {
  id: string;
  name: string;
  value: number;
  unit?: string;
  percent?: number;
}

export interface MetricSummary {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "flat";
  trendPercent?: number;
}

export interface RootCauseDriver {
  name: string;
  percent: number;
  description?: string;
}

export interface RootCauseAnalysis {
  drivers: RootCauseDriver[];
  confidence: number;
  summary: string;
}

export interface DrillDownItem {
  id: string;
  title: string;
  value: number;
  unit: string;
  details: string[];
}

export interface WasteAnalytics {
  timeSeries: TimeSeriesPoint[];
  byCategory: BreakdownItem[];
  byItem: BreakdownItem[];
  bySite: BreakdownItem[];
  byEvent: BreakdownItem[];
  rootCause: RootCauseAnalysis;
  summary: MetricSummary[];
}

export interface InventoryAnalytics {
  trends: TimeSeriesPoint[];
  turnoverRate: number;
  expirationRisk: BreakdownItem[];
  categoryUtilization: BreakdownItem[];
  storageUtilization: number;
  summary: MetricSummary[];
}

export interface AttendanceAnalytics {
  trends: TimeSeriesPoint[];
  forecastAccuracy: number;
  seasonality: TimeSeriesPoint[];
  eventImpact: BreakdownItem[];
  summary: MetricSummary[];
}

export interface DonationAnalytics {
  history: TimeSeriesPoint[];
  recipientPerformance: BreakdownItem[];
  mealsRescued: number;
  successRate: number;
  summary: MetricSummary[];
}

export interface ImpactMetricGroup {
  label: string;
  metrics: MetricSummary[];
  timeSeries: TimeSeriesPoint[];
}

export interface AnalyticsImpact {
  environmental: ImpactMetricGroup;
  financial: ImpactMetricGroup;
  community: ImpactMetricGroup;
  summary: MetricSummary[];
}

export interface HierarchyNode {
  id: string;
  name: string;
  level: HierarchyLevel;
  parentId: string | null;
}
