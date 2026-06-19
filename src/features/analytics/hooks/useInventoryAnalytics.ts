"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInventoryAnalytics } from "@/lib/api/analytics-inventory";
import { analyticsKeys } from "@/features/analytics/hooks/analytics-keys";
import type { AnalyticsFilters } from "@/types/analytics";

export function useInventoryAnalytics(
  orgId: string | null,
  filters: AnalyticsFilters | null,
) {
  return useQuery({
    queryKey: analyticsKeys.inventory(orgId ?? "", filters!),
    queryFn: () => fetchInventoryAnalytics(orgId!, filters!),
    enabled: Boolean(orgId && filters),
    staleTime: 300_000,
  });
}
