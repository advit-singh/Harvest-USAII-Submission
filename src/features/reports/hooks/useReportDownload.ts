"use client";

import { useMutation } from "@tanstack/react-query";
import { downloadReport } from "@/lib/api/reports";
import { getMockWasteAnalytics } from "@/lib/mocks/analytics-fixtures";
import { toAnalyticsFilters } from "@/features/analytics/config/analytics-tabs";
import { DEFAULT_ANALYTICS_FILTERS } from "@/features/analytics/schemas/analytics-filters.schema";

function buildReportBody(orgId: string, format: string, fileName: string): Blob {
  const waste = getMockWasteAnalytics(orgId, toAnalyticsFilters(DEFAULT_ANALYTICS_FILTERS));
  const lines = [
    `Harvest Report — ${fileName}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "WASTE SUMMARY",
    ...waste.summary.map((m) => `- ${m.label}: ${m.value}${m.unit ? ` ${m.unit}` : ""}`),
    "",
    "WASTE BY CATEGORY",
    ...waste.byCategory.map((c) => `- ${c.name}: ${c.value} ${c.unit ?? ""}`),
    "",
    "ROOT CAUSE",
    waste.rootCause.summary,
  ];

  if (format === "csv") {
    const csvRows = [
      ["Category", "Value", "Unit"],
      ...waste.byCategory.map((c) => [c.name, String(c.value), c.unit ?? ""]),
    ];
    const csv = csvRows.map((row) => row.join(",")).join("\n");
    return new Blob([csv], { type: "text/csv" });
  }

  if (format === "pdf") {
    const text = lines.join("\n");
    return new Blob([text], { type: "application/pdf" });
  }

  return new Blob([lines.join("\n")], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export function useReportDownload(orgId?: string) {
  return useMutation({
    mutationFn: async (reportId: string) => {
      const result = await downloadReport(reportId);
      const blob = buildReportBody(
        orgId ?? "org_demo_123",
        result.format,
        result.fileName,
      );
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
