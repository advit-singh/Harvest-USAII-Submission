"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchForecasts } from "@/lib/api/forecasts";
import { forecastKeys } from "@/features/predictions/hooks/predictions-keys";

export { forecastKeys };

export function useForecasts(orgId: string | null) {
  return useQuery({
    queryKey: forecastKeys.list(orgId ?? ""),
    queryFn: () => fetchForecasts({ orgId: orgId! }),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
