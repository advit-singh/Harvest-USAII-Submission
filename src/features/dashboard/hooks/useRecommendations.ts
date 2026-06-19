"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchRecommendations,
  submitRecommendationAction,
} from "@/lib/api/recommendations";
import type { RecommendationActionInput } from "@/types/recommendation";

export const recommendationKeys = {
  all: ["recommendations"] as const,
  list: (orgId: string) => [...recommendationKeys.all, orgId] as const,
};

export function useRecommendations(orgId: string | null, limit = 3) {
  return useQuery({
    queryKey: [...recommendationKeys.list(orgId ?? ""), limit],
    queryFn: () =>
      fetchRecommendations({ orgId: orgId!, status: "open", limit }),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });
}

export function useRecommendationAction(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: RecommendationActionInput;
    }) => submitRecommendationAction(id, input),
    onSuccess: () => {
      if (orgId) {
        queryClient.invalidateQueries({
          queryKey: recommendationKeys.list(orgId),
        });
      }
    },
  });
}
