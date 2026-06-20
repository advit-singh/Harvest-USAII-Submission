"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAttendanceAnalytics } from "@/lib/api/analytics-attendance";
import { analyticsKeys } from "@/features/analytics/hooks/analytics-keys";
import type { AnalyticsFilters } from "@/types/analytics";

export function useAttendanceAnalytics(
  orgId: string | null,
  filters: AnalyticsFilters | null,
) {
  return useQuery({
    queryKey: analyticsKeys.attendance(orgId ?? "", filters!),
    queryFn: () => fetchAttendanceAnalytics(orgId!, filters!),
    enabled: Boolean(orgId && filters),
    staleTime: 300_000,
  });
}
