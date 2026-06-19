"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWasteAnalytics } from "@/lib/api/analytics-waste";
import { analyticsKeys } from "@/features/analytics/hooks/analytics-keys";
import type { AnalyticsFilters } from "@/types/analytics";

export function useWasteAnalytics(
  orgId: string | null,
  filters: AnalyticsFilters | null,
) {
  return useQuery({
    queryKey: analyticsKeys.waste(orgId ?? "", filters!),
    queryFn: () => fetchWasteAnalytics(orgId!, filters!),
    enabled: Boolean(orgId && filters),
    staleTime: 300_000,
  });
}
