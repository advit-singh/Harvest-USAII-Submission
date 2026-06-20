"use client";

import { useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ReportStatusBadge } from "@/features/reports/components/generated/ReportStatusBadge";
import { useReportDetail } from "@/features/reports/hooks/useReports";
import { useReportDownload } from "@/features/reports/hooks/useReportDownload";
import { useGenerateReport } from "@/features/reports/hooks/useGenerateReport";
import type { ReportDetail } from "@/types/report";

interface ReportDetailDrawerProps {
  orgId: string;
  reportId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canGenerate: boolean;
  onRegenerated?: (reportId: string) => void;
}

function DetailContent({
  report,
  onDownload,
  onRegenerate,
  canGenerate,
  isDownloading,
  isRegenerating,
}: {
  report: ReportDetail;
  onDownload: () => void;
  onRegenerate: () => void;
  canGenerate: boolean;
  isDownloading: boolean;
  isRegenerating: boolean;
}) {
  return (
    <div className="space-y-4 px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <ReportStatusBadge status={report.status} />
        <span className="text-sm text-muted-foreground uppercase">
          {report.format}
        </span>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Site</dt>
          <dd className="font-medium">{report.siteName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Creator</dt>
          <dd className="font-medium">{report.generatedByName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Date range</dt>
          <dd className="font-medium">
            {report.dateRange.start} – {report.dateRange.end}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created</dt>
          <dd className="font-medium">
            {new Date(report.createdAt).toLocaleString()}
          </dd>
        </div>
      </dl>

      {(report.status === "queued" || report.status === "generating") && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Generating report…</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${report.progress}%` }}
              role="progressbar"
              aria-valuenow={report.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {report.progress}% complete
          </p>
        </div>
      )}

      {report.status === "failed" && report.errorMessage && (
        <p className="text-sm text-destructive">{report.errorMessage}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {report.status === "ready" && (
          <Button onClick={onDownload} disabled={isDownloading}>
            {isDownloading ? "Downloading…" : "Download"}
          </Button>
        )}
        {canGenerate && (
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating}
          >
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        )}
        {report.status === "ready" && (
          <Button
            variant="ghost"
            onClick={() => {
              const url = `${window.location.origin}/reports?tab=generated&id=${report.id}`;
              void navigator.clipboard.writeText(url);
            }}
          >
            Copy share link
          </Button>
        )}
      </div>
    </div>
  );
}

export function ReportDetailDrawer({
  orgId,
  reportId,
  open,
  onOpenChange,
  canGenerate,
  onRegenerated,
}: ReportDetailDrawerProps) {
  const detailQuery = useReportDetail(open ? reportId : null);
  const download = useReportDownload();
  const regenerate = useGenerateReport(orgId);

  useEffect(() => {
    if (!open) download.reset();
  }, [open, download]);

  const handleRegenerate = () => {
    const report = detailQuery.data;
    if (!report) return;
    regenerate.mutate(
      {
        organizationId: orgId,
        template: report.template,
        siteId: report.siteId,
        format: report.format,
        dateRange: report.dateRange,
      },
      {
        onSuccess: (data) => {
          onRegenerated?.(data.id);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>
            {detailQuery.data?.templateName ?? "Report details"}
          </DrawerTitle>
        </DrawerHeader>

        {detailQuery.isLoading ? (
          <LoadingState rows={3} />
        ) : detailQuery.isError ? (
          <ErrorState
            message="Unable to load report details."
            onRetry={() => detailQuery.refetch()}
          />
        ) : detailQuery.data ? (
          <DetailContent
            report={detailQuery.data}
            onDownload={() => reportId && download.mutate(reportId)}
            onRegenerate={handleRegenerate}
            canGenerate={canGenerate}
            isDownloading={download.isPending}
            isRegenerating={regenerate.isPending}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
