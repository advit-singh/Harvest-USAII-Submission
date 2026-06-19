import { apiClient } from "@/lib/api/client";
import { buildAnalyticsQuery } from "@/lib/api/analytics-query";
import { getMockAnalyticsImpact } from "@/lib/mocks/analytics-fixtures";
import type { AnalyticsFilters, AnalyticsImpact } from "@/types/analytics";

export async function fetchAnalyticsImpact(
  orgId: string,
  filters: AnalyticsFilters,
): Promise<AnalyticsImpact> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockAnalyticsImpact(orgId, filters);
  }

  return apiClient<AnalyticsImpact>(
    `/analytics/impact?${buildAnalyticsQuery(orgId, filters)}`,
  );
}
