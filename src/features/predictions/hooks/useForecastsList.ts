"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchForecasts,
  fetchForecastSummaryKpis,
} from "@/lib/api/forecasts";
import { forecastKeys, predictionsKeys } from "@/features/predictions/hooks/predictions-keys";
import type { PredictionsFilters } from "@/types/predictions";

export function useForecastSummaryKpis(orgId: string | null) {
  return useQuery({
    queryKey: predictionsKeys.summary(orgId ?? ""),
    queryFn: () => fetchForecastSummaryKpis(orgId!),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}

export function useForecastsList(
  orgId: string | null,
  filters?: PredictionsFilters,
) {
  const filterKey = {
    forecastType: filters?.forecastType ?? undefined,
    siteId: filters?.siteId ?? undefined,
  };

  return useQuery({
    queryKey: forecastKeys.list(orgId ?? "", filterKey),
    queryFn: () =>
      fetchForecasts({
        orgId: orgId!,
        forecastType: filters?.forecastType ?? undefined,
        siteId: filters?.siteId ?? undefined,
      }),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
