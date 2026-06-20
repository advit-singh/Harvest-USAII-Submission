"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchReportTemplates } from "@/lib/api/reports";
import { reportKeys } from "@/features/reports/config/report-keys";

export function useReportTemplates(orgId: string | null) {
  return useQuery({
    queryKey: reportKeys.templates(orgId ?? ""),
    queryFn: () => fetchReportTemplates(orgId ?? undefined),
    enabled: Boolean(orgId),
    staleTime: 300_000,
  });
}
