"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchForecastById } from "@/lib/api/forecasts";
import { forecastKeys } from "@/features/predictions/hooks/predictions-keys";

export function useForecastDetail(id: string | null) {
  return useQuery({
    queryKey: forecastKeys.detail(id ?? ""),
    queryFn: () => fetchForecastById(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
