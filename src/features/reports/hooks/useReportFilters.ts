"use client";

import { useMemo } from "react";
import { useReportsStore } from "@/store/reports-store";
import { toReportFilters } from "@/features/reports/config/report-tabs";
import { DEFAULT_REPORT_FILTERS } from "@/features/reports/schemas/report-filters.schema";
import type { ReportTabId, ReportTemplateId } from "@/types/report";
import type { ReportFiltersInput } from "@/features/reports/schemas/report-filters.schema";

export function useReportFilters(orgId: string | null) {
  const stored = useReportsStore((s) => (orgId ? s.orgStates[orgId] : undefined));
  const setFilters = useReportsStore((s) => s.setFilters);
  const setActiveTab = useReportsStore((s) => s.setActiveTab);
  const setSelectedReportId = useReportsStore((s) => s.setSelectedReportId);
  const setBuilderOpen = useReportsStore((s) => s.setBuilderOpen);
  const resetFilters = useReportsStore((s) => s.resetFilters);

  const orgState = useMemo(() => {
    if (!orgId) return null;
    const defaults = {
      filters: { ...DEFAULT_REPORT_FILTERS },
      activeTab: "templates" as ReportTabId,
      selectedReportId: null as string | null,
      builderOpen: false,
      builderTemplate: null as ReportTemplateId | null,
    };
    if (!stored) return defaults;
    return {
      ...defaults,
      ...stored,
      filters: { ...defaults.filters, ...stored.filters },
    };
  }, [orgId, stored]);

  const updateFilters = (partial: Partial<ReportFiltersInput>) => {
    if (!orgId) return;
    setFilters(orgId, partial);
  };

  const updateActiveTab = (tab: ReportTabId) => {
    if (!orgId) return;
    setActiveTab(orgId, tab);
  };

  const selectReport = (id: string | null) => {
    if (!orgId) return;
    setSelectedReportId(orgId, id);
  };

  const openBuilder = (template: ReportTemplateId | null = null) => {
    if (!orgId) return;
    setBuilderOpen(orgId, true, template);
  };

  const closeBuilder = () => {
    if (!orgId) return;
    setBuilderOpen(orgId, false);
  };

  const reset = () => {
    if (!orgId) return;
    resetFilters(orgId);
  };

  const apiFilters =
    orgId && orgState?.filters
      ? toReportFilters(orgState.filters, orgId)
      : null;

  return {
    filters: orgState?.filters ?? null,
    apiFilters,
    activeTab: orgState?.activeTab ?? "templates",
    selectedReportId: orgState?.selectedReportId ?? null,
    builderOpen: orgState?.builderOpen ?? false,
    builderTemplate: orgState?.builderTemplate ?? null,
    updateFilters,
    updateActiveTab,
    selectReport,
    openBuilder,
    closeBuilder,
    reset,
  };
}
