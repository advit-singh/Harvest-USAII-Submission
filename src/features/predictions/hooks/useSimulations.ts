"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSimulations } from "@/lib/api/simulations";
import { simulationKeys } from "@/features/predictions/hooks/predictions-keys";

export function useSimulations(orgId: string | null) {
  return useQuery({
    queryKey: simulationKeys.list(orgId ?? ""),
    queryFn: () => fetchSimulations(orgId!),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
