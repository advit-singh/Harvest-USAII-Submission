"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignRecommendation } from "@/lib/api/recommendations";
import { recommendationKeys } from "@/features/predictions/hooks/predictions-keys";
import type { RecommendationAssignInput } from "@/types/recommendation";

export function useRecommendationAssign(orgId: string | null) {
  void orgId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: RecommendationAssignInput;
    }) => assignRecommendation(id, input),
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
