import { apiClient } from "@/lib/api/client";
import { buildAnalyticsQuery } from "@/lib/api/analytics-query";
import { getMockInventoryAnalytics } from "@/lib/mocks/analytics-fixtures";
import type { AnalyticsFilters, InventoryAnalytics } from "@/types/analytics";

export async function fetchInventoryAnalytics(
  orgId: string,
  filters: AnalyticsFilters,
): Promise<InventoryAnalytics> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockInventoryAnalytics(orgId, filters);
  }

  return apiClient<InventoryAnalytics>(
    `/analytics/inventory?${buildAnalyticsQuery(orgId, filters)}`,
  );
}
