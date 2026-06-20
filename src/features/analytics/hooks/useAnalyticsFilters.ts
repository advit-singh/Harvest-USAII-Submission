"use client";

import { useAnalyticsStore } from "@/store/analytics-store";
import { toAnalyticsFilters } from "@/features/analytics/config/analytics-tabs";
import type { AnalyticsTabId } from "@/types/analytics";
import type { AnalyticsFiltersInput } from "@/features/analytics/schemas/analytics-filters.schema";

export function useAnalyticsFilters(orgId: string | null) {
  const getStateForOrg = useAnalyticsStore((s) => s.getStateForOrg);
  const setFilters = useAnalyticsStore((s) => s.setFilters);
  const setActiveTab = useAnalyticsStore((s) => s.setActiveTab);
  const resetFilters = useAnalyticsStore((s) => s.resetFilters);

  const orgState = orgId ? getStateForOrg(orgId) : null;
  const filters = orgState?.filters ?? null;
  const activeTab = orgState?.activeTab ?? "waste";

  const updateFilters = (partial: Partial<AnalyticsFiltersInput>) => {
    if (!orgId) return;
    setFilters(orgId, partial);
  };

  const updateActiveTab = (tab: AnalyticsTabId) => {
    if (!orgId) return;
    setActiveTab(orgId, tab);
  };

  const reset = () => {
    if (!orgId) return;
    resetFilters(orgId);
  };

  const apiFilters = filters ? toAnalyticsFilters(filters) : null;

  return {
    filters,
    apiFilters,
    activeTab,
    updateFilters,
    updateActiveTab,
    reset,
  };
}
