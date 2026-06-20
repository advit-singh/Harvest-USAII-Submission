import { apiClient } from "@/lib/api/client";
import { buildAnalyticsQuery } from "@/lib/api/analytics-query";
import { getMockDonationAnalytics } from "@/lib/mocks/analytics-fixtures";
import type { AnalyticsFilters, DonationAnalytics } from "@/types/analytics";

export async function fetchDonationAnalytics(
  orgId: string,
  filters: AnalyticsFilters,
): Promise<DonationAnalytics> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockDonationAnalytics(orgId, filters);
  }

  return apiClient<DonationAnalytics>(
    `/analytics/donations?${buildAnalyticsQuery(orgId, filters)}`,
  );
}
