"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchRecommendations,
  submitRecommendationAction,
} from "@/lib/api/recommendations";
import { recommendationKeys } from "@/features/predictions/hooks/predictions-keys";
import type { RecommendationActionInput } from "@/types/recommendation";

export { recommendationKeys };

export function useRecommendations(orgId: string | null, limit = 3) {
  return useQuery({
    queryKey: [...recommendationKeys.list(orgId ?? ""), { limit }],
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
          queryKey: recommendationKeys.all,
        });
      }
    },
  });
}
