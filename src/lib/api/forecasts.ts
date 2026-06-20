import { apiClient } from "@/lib/api/client";
import {
  getMockForecasts,
} from "@/lib/mocks/dashboard-fixtures";
import {
  filterMockForecasts,
  getMockForecastDetail,
  getMockForecastSummaryKpis,
} from "@/lib/mocks/predictions-fixtures";
import type {
  ForecastDetail,
  ForecastSummary,
  GenerateForecastInput,
  GenerateForecastResponse,
} from "@/types/forecast";
import type { ForecastSummaryKpis } from "@/types/predictions";

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
    const all = getMockForecasts();
    return filterMockForecasts(all, {
      forecastType: filters.forecastType,
      siteId: filters.siteId,
    });
  }

  const params = new URLSearchParams({ organizationId: filters.orgId });
  if (filters.forecastType) params.set("forecastType", filters.forecastType);
  if (filters.siteId) params.set("siteId", filters.siteId);

  return apiClient<ForecastSummary[]>(`/forecasts?${params.toString()}`);
}

export async function fetchForecastById(id: string): Promise<ForecastDetail> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 200));
    const detail = getMockForecastDetail(id);
    if (!detail) {
      throw new Error("Forecast not found");
    }
    return detail;
  }

  return apiClient<ForecastDetail>(`/forecasts/${id}`);
}

export async function fetchForecastSummaryKpis(
  orgId: string,
): Promise<ForecastSummaryKpis> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 180));
    if (orgId.startsWith("org_empty") || orgId === "org_new") {
      return {
        predictedSurplusMeals: 0,
        predictedWasteMeals: 0,
        expirationRiskItems: 0,
        attendanceForecast: 0,
        purchasingForecast: 0,
        confidence: 0,
        forecastWindowDays: 7,
        siteName: "",
      };
    }
    return getMockForecastSummaryKpis();
  }

  return apiClient<ForecastSummaryKpis>(
    `/forecasts/summary?organizationId=${orgId}`,
  );
}

export async function generateForecast(
  orgId: string,
  input: GenerateForecastInput,
): Promise<GenerateForecastResponse> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await new Promise((r) => setTimeout(r, 800));
    return { forecastId: "fcst_001" };
  }

  return apiClient<GenerateForecastResponse>("/forecasts/generate", {
    method: "POST",
    body: JSON.stringify({ ...input, organizationId: orgId }),
  });
}
