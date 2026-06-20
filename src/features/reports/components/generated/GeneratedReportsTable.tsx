"use client";

import { Button } from "@/components/ui/button";
import { ReportStatusBadge } from "@/features/reports/components/generated/ReportStatusBadge";
import type { ReportSummary } from "@/types/report";

interface GeneratedReportsTableProps {
  reports: ReportSummary[];
  onSelect: (id: string) => void;
  onDownload: (id: string) => void;
  downloadingId?: string | null;
}

export function GeneratedReportsTable({
  reports,
  onSelect,
  onDownload,
  downloadingId,
}: GeneratedReportsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="p-3 font-medium" scope="col">
              Report
            </th>
            <th className="p-3 font-medium" scope="col">
              Site
            </th>
            <th className="p-3 font-medium" scope="col">
              Status
            </th>
            <th className="p-3 font-medium" scope="col">
              Format
            </th>
            <th className="p-3 font-medium" scope="col">
              Generated
            </th>
            <th className="p-3 font-medium" scope="col">
              Creator
            </th>
            <th className="p-3 font-medium" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-b last:border-0">
              <td className="p-3">
                <button
                  type="button"
                  className="text-left font-medium hover:underline"
                  onClick={() => onSelect(report.id)}
                >
                  {report.templateName}
                </button>
                <p className="text-xs text-muted-foreground">
                  {report.dateRange.start} – {report.dateRange.end}
                </p>
              </td>
              <td className="p-3">{report.siteName}</td>
              <td className="p-3">
                <ReportStatusBadge status={report.status} />
              </td>
              <td className="p-3 uppercase">{report.format}</td>
              <td className="p-3 text-muted-foreground">
                {report.generatedAt
                  ? new Date(report.generatedAt).toLocaleString()
                  : new Date(report.createdAt).toLocaleString()}
              </td>
              <td className="p-3">{report.generatedByName}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(report.id)}
                  >
                    View
                  </Button>
                  {report.status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() => onDownload(report.id)}
                      disabled={downloadingId === report.id}
                    >
                      {downloadingId === report.id ? "Downloading…" : "Download"}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
