"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyOrgDashboard } from "@/features/organizations/components/EmptyOrgDashboard";
import { ReportsToolbar } from "@/features/reports/components/ReportsToolbar";
import { ReportsTabNav } from "@/features/reports/components/ReportsTabNav";
import { ReportBuilderDrawer } from "@/features/reports/components/builder/ReportBuilderDrawer";
import { useReportFilters } from "@/features/reports/hooks/useReportFilters";
import { useCanGenerateReports } from "@/features/reports/hooks/useCanGenerateReports";
import { VALID_REPORT_TABS } from "@/features/reports/config/report-tabs";
import type { ReportTabId } from "@/types/report";

interface ReportsShellProps {
  orgId: string | null;
}

export function ReportsShell({ orgId }: ReportsShellProps) {
  const searchParams = useSearchParams();
  const { canGenerate } = useCanGenerateReports(orgId);

  const {
    filters,
    apiFilters,
    activeTab,
    selectedReportId,
    builderOpen,
    builderTemplate,
    updateFilters,
    updateActiveTab,
    selectReport,
    openBuilder,
    closeBuilder,
    reset,
  } = useReportFilters(orgId);

  const tabParam = searchParams.get("tab");
  const idParam = searchParams.get("id");
  const urlTab =
    tabParam && VALID_REPORT_TABS.includes(tabParam as ReportTabId)
      ? (tabParam as ReportTabId)
      : null;

  useEffect(() => {
    if (urlTab && urlTab !== activeTab && orgId) {
      updateActiveTab(urlTab);
    }
  }, [urlTab, activeTab, orgId, updateActiveTab]);

  useEffect(() => {
    if (idParam && orgId) {
      selectReport(idParam);
      if (activeTab !== "generated") {
        updateActiveTab("generated");
      }
    }
  }, [idParam, orgId, selectReport, activeTab, updateActiveTab]);

  if (!orgId || !filters || !apiFilters) {
    return <EmptyOrgDashboard />;
  }

  const handleGenerated = (reportId: string) => {
    updateActiveTab("generated");
    selectReport(reportId);
  };

  return (
    <div className="space-y-6">
      <ReportsToolbar
        canGenerate={canGenerate}
        onResetFilters={reset}
        onNewReport={() => openBuilder("monthly_summary")}
      />
      <ReportsTabNav
        orgId={orgId}
        filters={filters}
        apiFilters={apiFilters}
        activeTab={activeTab}
        selectedReportId={selectedReportId}
        canGenerate={canGenerate}
        onTabChange={updateActiveTab}
        onFiltersChange={updateFilters}
        onSelectReport={selectReport}
        onOpenBuilder={openBuilder}
      />
      <ReportBuilderDrawer
        orgId={orgId}
        open={builderOpen}
        initialTemplate={builderTemplate}
        onOpenChange={(open) => {
          if (!open) closeBuilder();
        }}
        onGenerated={handleGenerated}
      />
    </div>
  );
}
