"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REPORT_TABS } from "@/features/reports/config/report-tabs";
import { TemplatesTab } from "@/features/reports/components/templates/TemplatesTab";
import { GeneratedTab } from "@/features/reports/components/generated/GeneratedTab";
import { ScheduledTab } from "@/features/reports/components/scheduled/ScheduledTab";
import { ExportsTab } from "@/features/reports/components/exports/ExportsTab";
import { ReportDetailDrawer } from "@/features/reports/components/generated/ReportDetailDrawer";
import type { ReportTabId, ReportTemplateId } from "@/types/report";
import type { ReportFilters } from "@/types/report";
import type { ReportFiltersInput } from "@/features/reports/schemas/report-filters.schema";

interface ReportsTabNavProps {
  orgId: string;
  filters: ReportFiltersInput;
  apiFilters: ReportFilters;
  activeTab: ReportTabId;
  selectedReportId: string | null;
  canGenerate: boolean;
  onTabChange: (tab: ReportTabId) => void;
  onFiltersChange: (partial: Partial<ReportFiltersInput>) => void;
  onSelectReport: (id: string | null) => void;
  onOpenBuilder: (template: ReportTemplateId) => void;
}

export function ReportsTabNav({
  orgId,
  filters,
  apiFilters,
  activeTab,
  selectedReportId,
  canGenerate,
  onTabChange,
  onFiltersChange,
  onSelectReport,
  onOpenBuilder,
}: ReportsTabNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as ReportTabId;
      onTabChange(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      if (tab !== "generated") {
        params.delete("id");
      }
      router.replace(`/reports?${params.toString()}`, { scroll: false });
    },
    [onTabChange, router, searchParams],
  );

  const handleSelectReport = (id: string) => {
    onSelectReport(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "generated");
    params.set("id", id);
    router.replace(`/reports?${params.toString()}`, { scroll: false });
  };

  const detailOpen = Boolean(selectedReportId);

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 data-[state=active]:bg-background"
              >
                <Icon className="h-4 w-4" aria-hidden />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <TemplatesTab
            orgId={orgId}
            canGenerate={canGenerate}
            onOpenBuilder={onOpenBuilder}
          />
        </TabsContent>

        <TabsContent value="generated" className="mt-4">
          <GeneratedTab
            orgId={orgId}
            filters={filters}
            apiFilters={apiFilters}
            onFiltersChange={onFiltersChange}
            onSelectReport={handleSelectReport}
          />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <ScheduledTab orgId={orgId} />
        </TabsContent>

        <TabsContent value="exports" className="mt-4">
          <ExportsTab orgId={orgId} apiFilters={apiFilters} />
        </TabsContent>
      </Tabs>

      <ReportDetailDrawer
        orgId={orgId}
        reportId={selectedReportId}
        open={detailOpen}
        onOpenChange={(open) => {
          if (!open) {
            onSelectReport(null);
            const params = new URLSearchParams(searchParams.toString());
            params.delete("id");
            router.replace(`/reports?${params.toString()}`, { scroll: false });
          }
        }}
        canGenerate={canGenerate}
        onRegenerated={(id) => handleSelectReport(id)}
      />
    </>
  );
}
