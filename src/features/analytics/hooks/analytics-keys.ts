import type { AnalyticsFilters } from "@/types/analytics";

export const analyticsKeys = {
  all: ["analytics"] as const,
  waste: (orgId: string, filters: AnalyticsFilters) =>
    [...analyticsKeys.all, "waste", orgId, filters] as const,
  inventory: (orgId: string, filters: AnalyticsFilters) =>
    [...analyticsKeys.all, "inventory", orgId, filters] as const,
  attendance: (orgId: string, filters: AnalyticsFilters) =>
    [...analyticsKeys.all, "attendance", orgId, filters] as const,
  donations: (orgId: string, filters: AnalyticsFilters) =>
    [...analyticsKeys.all, "donations", orgId, filters] as const,
  impact: (orgId: string, filters: AnalyticsFilters) =>
    [...analyticsKeys.all, "impact", orgId, filters] as const,
};
