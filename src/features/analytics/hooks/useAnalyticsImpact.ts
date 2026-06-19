"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsImpact } from "@/lib/api/analytics-impact";
import { analyticsKeys } from "@/features/analytics/hooks/analytics-keys";
import type { AnalyticsFilters } from "@/types/analytics";

export function useAnalyticsImpact(
  orgId: string | null,
  filters: AnalyticsFilters | null,
) {
  return useQuery({
    queryKey: analyticsKeys.impact(orgId ?? "", filters!),
    queryFn: () => fetchAnalyticsImpact(orgId!, filters!),
    enabled: Boolean(orgId && filters),
    staleTime: 300_000,
  });
}
