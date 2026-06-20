"use client";

import { useMutation } from "@tanstack/react-query";
import { compareSimulations } from "@/lib/api/simulations";
import { simulationKeys } from "@/features/predictions/hooks/predictions-keys";

export function useCompareSimulations() {
  return useMutation({
    mutationKey: simulationKeys.compare([]),
    mutationFn: (simulationIds: string[]) =>
      compareSimulations(simulationIds),
  });
}
