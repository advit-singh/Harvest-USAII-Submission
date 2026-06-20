"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateForecast } from "@/lib/api/forecasts";
import { forecastKeys, predictionsKeys } from "@/features/predictions/hooks/predictions-keys";
import type { GenerateForecastInput } from "@/types/forecast";

export function useGenerateForecast(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateForecastInput) =>
      generateForecast(orgId!, input),
    onSuccess: () => {
      if (!orgId) return;
      void queryClient.invalidateQueries({ queryKey: forecastKeys.all });
      void queryClient.invalidateQueries({
        queryKey: predictionsKeys.summary(orgId),
      });
    },
  });
}
