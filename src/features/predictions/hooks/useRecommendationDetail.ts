"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRecommendationById } from "@/lib/api/recommendations";
import { recommendationKeys } from "@/features/predictions/hooks/predictions-keys";

export function useRecommendationDetail(id: string | null) {
  return useQuery({
    queryKey: recommendationKeys.detail(id ?? ""),
    queryFn: () => fetchRecommendationById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
