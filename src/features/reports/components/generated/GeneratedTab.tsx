"use client";

import { FileStack } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ReportsQueryState } from "@/features/reports/components/ReportsQueryState";
import { GeneratedReportsTable } from "@/features/reports/components/generated/GeneratedReportsTable";
import { useReportsList } from "@/features/reports/hooks/useReports";
import { useReportDownload } from "@/features/reports/hooks/useReportDownload";
import { useOrgSites } from "@/features/organizations/hooks/useOrgSites";
import type { ReportFilters } from "@/types/report";
import type { ReportFiltersInput } from "@/features/reports/schemas/report-filters.schema";

interface GeneratedTabProps {
  orgId: string;
  filters: ReportFiltersInput;
  apiFilters: ReportFilters;
  onFiltersChange: (partial: Partial<ReportFiltersInput>) => void;
  onSelectReport: (id: string) => void;
}

export function GeneratedTab({
  orgId,
  filters,
  apiFilters,
  onFiltersChange,
  onSelectReport,
}: GeneratedTabProps) {
  const query = useReportsList(orgId, apiFilters);
  const download = useReportDownload(orgId);
  const { siteOptions } = useOrgSites(orgId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="min-w-[140px] space-y-1">
          <Label htmlFor="report-status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({
                status: value as ReportFiltersInput["status"],
              })
            }
          >
            <SelectTrigger id="report-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[180px] space-y-1">
          <Label htmlFor="report-site">Site</Label>
          <Select
            value={filters.siteId}
            onValueChange={(value) => onFiltersChange({ siteId: value })}
          >
            <SelectTrigger id="report-site">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {siteOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[200px] flex-1 space-y-1">
          <Label htmlFor="report-search">Search</Label>
          <Input
            id="report-search"
            placeholder="Search reports…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>
      </div>

      <ReportsQueryState
        query={query}
        emptyIcon={FileStack}
        emptyTitle="No generated reports"
        emptyDescription="Reports you generate will appear here with status and download options."
        isEmpty={(data) => data.length === 0}
      >
        {(reports) => (
          <GeneratedReportsTable
            reports={reports}
            onSelect={onSelectReport}
            onDownload={(id) => download.mutate(id)}
            downloadingId={download.isPending ? download.variables : null}
          />
        )}
      </ReportsQueryState>
    </div>
  );
}
