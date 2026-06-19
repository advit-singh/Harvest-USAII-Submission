import { apiClient } from "@/lib/api/client";
import { buildAnalyticsQuery } from "@/lib/api/analytics-query";
import { getMockWasteAnalytics } from "@/lib/mocks/analytics-fixtures";
import type { AnalyticsFilters, WasteAnalytics } from "@/types/analytics";

export async function fetchWasteAnalytics(
  orgId: string,
  filters: AnalyticsFilters,
): Promise<WasteAnalytics> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockWasteAnalytics(orgId, filters);
  }

  return apiClient<WasteAnalytics>(
    `/analytics/waste?${buildAnalyticsQuery(orgId, filters)}`,
  );
}
