"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitRecommendationAction } from "@/lib/api/recommendations";
import { recommendationKeys } from "@/features/predictions/hooks/predictions-keys";
import type { RecommendationActionInput } from "@/types/recommendation";

export function useRecommendationAction(orgId: string | null) {
  void orgId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: RecommendationActionInput;
    }) => submitRecommendationAction(id, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: recommendationKeys.all,
      });
      void queryClient.invalidateQueries({
        queryKey: recommendationKeys.detail(variables.id),
      });
    },
  });
}
