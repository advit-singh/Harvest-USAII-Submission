import { apiClient } from "@/lib/api/client";
import { buildAnalyticsQuery } from "@/lib/api/analytics-query";
import { getMockAttendanceAnalytics } from "@/lib/mocks/analytics-fixtures";
import type { AnalyticsFilters, AttendanceAnalytics } from "@/types/analytics";

export async function fetchAttendanceAnalytics(
  orgId: string,
  filters: AnalyticsFilters,
): Promise<AttendanceAnalytics> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    return getMockAttendanceAnalytics(orgId, filters);
  }

  return apiClient<AttendanceAnalytics>(
    `/analytics/attendance?${buildAnalyticsQuery(orgId, filters)}`,
  );
}
