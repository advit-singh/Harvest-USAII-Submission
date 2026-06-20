import type { AnalyticsFilters } from "@/types/analytics";

export function buildAnalyticsQuery(
  orgId: string,
  filters: AnalyticsFilters,
): string {
  const params = new URLSearchParams({ organizationId: orgId });

  params.set("timeRange", filters.timeRange);

  if (filters.siteId) params.set("siteId", filters.siteId);
  if (filters.hierarchyLevel) params.set("hierarchyLevel", filters.hierarchyLevel);
  if (filters.hierarchyId) params.set("hierarchyId", filters.hierarchyId);
  if (filters.category) params.set("category", filters.category);
  if (filters.eventId) params.set("eventId", filters.eventId);

  return params.toString();
}
