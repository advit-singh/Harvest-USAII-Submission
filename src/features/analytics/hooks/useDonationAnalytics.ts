"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDonationAnalytics } from "@/lib/api/analytics-donations";
import { analyticsKeys } from "@/features/analytics/hooks/analytics-keys";
import type { AnalyticsFilters } from "@/types/analytics";

export function useDonationAnalytics(
  orgId: string | null,
  filters: AnalyticsFilters | null,
) {
  return useQuery({
    queryKey: analyticsKeys.donations(orgId ?? "", filters!),
    queryFn: () => fetchDonationAnalytics(orgId!, filters!),
    enabled: Boolean(orgId && filters),
    staleTime: 300_000,
  });
}
