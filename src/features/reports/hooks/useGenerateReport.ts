"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateReport } from "@/lib/api/reports";
import { reportKeys } from "@/features/reports/config/report-keys";
import type { GenerateReportPayload } from "@/types/report";

export function useGenerateReport(orgId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateReportPayload) => generateReport(payload),
    onSuccess: () => {
      if (!orgId) return;
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
