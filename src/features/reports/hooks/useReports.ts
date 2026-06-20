"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchReportById, fetchReports } from "@/lib/api/reports";
import { reportKeys } from "@/features/reports/config/report-keys";
import type { ReportFilters } from "@/types/report";

export function useReportsList(orgId: string | null, filters: ReportFilters | null) {
  return useQuery({
    queryKey: reportKeys.list(orgId ?? "", filters!),
    queryFn: () => fetchReports(filters!),
    enabled: Boolean(orgId && filters),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.some((r) => r.status === "queued" || r.status === "generating")) {
        return false;
      }
      return 2000;
    },
  });
}

export function useReportDetail(reportId: string | null) {
  return useQuery({
    queryKey: reportKeys.detail(reportId ?? ""),
    queryFn: () => fetchReportById(reportId!),
    enabled: Boolean(reportId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "queued" || status === "generating") return 1500;
      return false;
    },
  });
}
