"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchForecasts } from "@/lib/api/forecasts";

export const forecastKeys = {
  all: ["forecasts"] as const,
  list: (orgId: string) => [...forecastKeys.all, orgId] as const,
};

export function useForecasts(orgId: string | null) {
  return useQuery({
    queryKey: forecastKeys.list(orgId ?? ""),
    queryFn: () => fetchForecasts({ orgId: orgId! }),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
