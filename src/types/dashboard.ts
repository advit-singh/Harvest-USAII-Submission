/** Dashboard layout types — API_SPEC §26 analytics/overview */

export type RiskLevel = "low" | "medium" | "high";

export type WidgetId =
  | "waste-risk"
  | "predicted-surplus"
  | "recommendations"
  | "inventory-health"
  | "impact-snapshot"
  | "donation-opportunities"
  | "recent-activity";

export interface DashboardOverview {
  hasOperationalData: boolean;
  riskLevel: RiskLevel;
  riskScore: number;
  forecastWindowDays: number;
  primaryDrivers: string[];
  openRecommendations: number;
  pendingUploads: number;
}

export interface GridLayoutItem {
  i: WidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface DashboardLayoutState {
  layouts: GridLayoutItem[];
  visibility: Record<WidgetId, boolean>;
  updatedAt: string;
}
