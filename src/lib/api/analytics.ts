import { apiClient } from "@/lib/api/client";
import { getMockDashboardOverview } from "@/lib/mocks/dashboard-fixtures";
import type { DashboardOverview } from "@/types/dashboard";

export async function fetchDashboardOverview(
  orgId: string,
): Promise<DashboardOverview> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockDashboardOverview(orgId);
  }

  return apiClient<DashboardOverview>(
    `/analytics/overview?organizationId=${orgId}`,
  );
}
