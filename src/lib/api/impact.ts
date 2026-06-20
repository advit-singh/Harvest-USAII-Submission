import { apiClient } from "@/lib/api/client";
import { getMockImpact } from "@/lib/mocks/dashboard-fixtures";
import type { ImpactMetrics, ImpactTimeRange } from "@/types/impact";

export async function fetchImpactMetrics(
  orgId: string,
  timeRange: ImpactTimeRange = "week",
): Promise<ImpactMetrics> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockImpact(timeRange);
  }

  return apiClient<ImpactMetrics>(
    `/impact?organizationId=${orgId}&timeRange=${timeRange}`,
  );
}
