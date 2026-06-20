"use client";

import { useMutation } from "@tanstack/react-query";
import { downloadReport } from "@/lib/api/reports";

export function useReportDownload() {
  return useMutation({
    mutationFn: async (reportId: string) => {
      const result = await downloadReport(reportId);
      if (result.fileUrl.startsWith("blob:mock-report-")) {
        const blob = new Blob(
          [`Mock ${result.format.toUpperCase()} report content for ${result.fileName}`],
          {
            type:
              result.format === "pdf"
                ? "application/pdf"
                : result.format === "csv"
                  ? "text/csv"
                  : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          },
        );
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = result.fileName;
        anchor.click();
        URL.revokeObjectURL(url);
        return result;
      }
      window.open(result.fileUrl, "_blank", "noopener,noreferrer");
      return result;
    },
  });
}
