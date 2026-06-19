"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchImpactMetrics } from "@/lib/api/impact";
import type { ImpactTimeRange } from "@/types/impact";

export const impactKeys = {
  all: ["impact"] as const,
  metrics: (orgId: string, range: ImpactTimeRange) =>
    [...impactKeys.all, orgId, range] as const,
};

export function useImpactMetrics(
  orgId: string | null,
  timeRange: ImpactTimeRange = "week",
) {
  return useQuery({
    queryKey: impactKeys.metrics(orgId ?? "", timeRange),
    queryFn: () => fetchImpactMetrics(orgId!, timeRange),
    enabled: Boolean(orgId),
    staleTime: 300_000,
  });
}
