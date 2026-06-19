import { apiClient } from "@/lib/api/client";
import { getMockForecasts } from "@/lib/mocks/dashboard-fixtures";
import type { ForecastSummary } from "@/types/forecast";

export interface ForecastFilters {
  orgId: string;
  forecastType?: string;
  siteId?: string;
}

export async function fetchForecasts(
  filters: ForecastFilters,
): Promise<ForecastSummary[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 250));
    return getMockForecasts();
  }

  const params = new URLSearchParams({ organizationId: filters.orgId });
  if (filters.forecastType) params.set("forecastType", filters.forecastType);
  if (filters.siteId) params.set("siteId", filters.siteId);

  return apiClient<ForecastSummary[]>(`/forecasts?${params.toString()}`);
}
