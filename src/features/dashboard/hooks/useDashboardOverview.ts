"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview } from "@/lib/api/analytics";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (orgId: string) => [...dashboardKeys.all, "overview", orgId] as const,
};

export function useDashboardOverview(orgId: string | null) {
  return useQuery({
    queryKey: dashboardKeys.overview(orgId ?? ""),
    queryFn: () => fetchDashboardOverview(orgId!),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
