"use client";

import { useMutation } from "@tanstack/react-query";
import { downloadReport } from "@/lib/api/reports";
import { isMockApiEnabled } from "@/lib/api/api-mode";
import {
  buildClientReportContent,
  renderClientReportBlob,
} from "@/lib/reports/client-report-generator";

export function useReportDownload(orgId?: string) {
  return useMutation({
    mutationFn: async (reportId: string) => {
      const result = await downloadReport(reportId);
      const resolvedOrgId = orgId ?? "org_demo_123";

      let blob: Blob;

      if (isMockApiEnabled() || result.fileUrl.startsWith("blob:mock-report")) {
        const content = buildClientReportContent(resolvedOrgId, result.fileName);
        blob = renderClientReportBlob(content, result.format);
      } else if (result.fileUrl.startsWith("data:")) {
        const response = await fetch(result.fileUrl);
        blob = await response.blob();
      } else {
        const response = await fetch(result.fileUrl);
        if (!response.ok) {
          throw new Error("Failed to download report file");
        }
        blob = await response.blob();
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      return result;
    },
  });
}
