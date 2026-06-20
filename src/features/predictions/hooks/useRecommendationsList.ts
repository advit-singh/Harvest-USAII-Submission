"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRecommendations } from "@/lib/api/recommendations";
import { recommendationKeys } from "@/features/predictions/hooks/predictions-keys";
import type { RecommendationFiltersInput } from "@/features/predictions/schemas/recommendation-filters.schema";

export function useRecommendationsList(
  orgId: string | null,
  filters: RecommendationFiltersInput,
) {
  const filterKey = {
    status: filters.status,
    priority: filters.priority,
    siteId: filters.siteId ?? undefined,
    sortBy: filters.sortBy,
  };

  return useQuery({
    queryKey: recommendationKeys.list(orgId ?? "", filterKey),
    queryFn: () =>
      fetchRecommendations({
        orgId: orgId!,
        status: filters.status === "all" ? "all" : filters.status,
        priority: filters.priority === "all" ? undefined : filters.priority,
        siteId: filters.siteId ?? undefined,
      }),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });
}
