"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSimulation,
  runSimulation,
  runSimulationPreview,
} from "@/lib/api/simulations";
import { simulationKeys } from "@/features/predictions/hooks/predictions-keys";
import type { CreateSimulationInput, SimulationInput } from "@/types/simulation";

export function useRunSimulation(orgId: string | null) {
  const queryClient = useQueryClient();

  const runById = useMutation({
    mutationFn: (id: string) => runSimulation(id),
  });

  const runPreview = useMutation({
    mutationFn: (changes: SimulationInput) => runSimulationPreview(changes),
  });

  const saveScenario = useMutation({
    mutationFn: (input: CreateSimulationInput) =>
      createSimulation(orgId!, input),
    onSuccess: () => {
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: simulationKeys.list(orgId),
        });
      }
    },
  });

  return { runById, runPreview, saveScenario };
}
