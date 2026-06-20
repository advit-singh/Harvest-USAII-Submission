"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportsQueryState } from "@/features/reports/components/ReportsQueryState";
import { useReportsList } from "@/features/reports/hooks/useReports";
import { useReportDownload } from "@/features/reports/hooks/useReportDownload";
import type { ReportFilters } from "@/types/report";
import type { ReportFormat } from "@/types/report";

interface ExportsTabProps {
  orgId: string;
  apiFilters: ReportFilters;
}

const FORMAT_ORDER: ReportFormat[] = ["pdf", "docx", "csv"];

export function ExportsTab({ orgId, apiFilters }: ExportsTabProps) {
  const readyFilters: ReportFilters = {
    ...apiFilters,
    status: "ready",
  };
  const query = useReportsList(orgId, readyFilters);
  const download = useReportDownload();

  return (
    <ReportsQueryState
      query={query}
      emptyIcon={Download}
      emptyTitle="No exports ready"
      emptyDescription="Ready reports will appear here grouped by format for quick download."
      isEmpty={(data) => data.length === 0}
    >
      {(reports) => {
        const byFormat = FORMAT_ORDER.map((format) => ({
          format,
          items: reports.filter((r) => r.format === format),
        })).filter((group) => group.items.length > 0);

        return (
          <div className="space-y-6">
            {byFormat.map(({ format, items }) => (
              <section key={format} className="rounded-lg border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="font-semibold uppercase">{format}</h3>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <ul className="space-y-2" role="list">
                  {items.map((report) => (
                    <li
                      key={report.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                    >
                      <div>
                        <p className="font-medium">{report.templateName}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.siteName} ·{" "}
                          {report.generatedAt
                            ? new Date(report.generatedAt).toLocaleDateString()
                            : "Pending"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => download.mutate(report.id)}
                        disabled={
                          download.isPending && download.variables === report.id
                        }
                      >
                        <Download className="mr-2 h-4 w-4" aria-hidden />
                        Download
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        );
      }}
    </ReportsQueryState>
  );
}
