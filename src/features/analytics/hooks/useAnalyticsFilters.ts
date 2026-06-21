"use client";

import { useMemo } from "react";
import { useAnalyticsStore } from "@/store/analytics-store";
import { toAnalyticsFilters } from "@/features/analytics/config/analytics-tabs";
import { DEFAULT_ANALYTICS_FILTERS } from "@/features/analytics/schemas/analytics-filters.schema";
import type { AnalyticsTabId } from "@/types/analytics";
import type { AnalyticsFiltersInput } from "@/features/analytics/schemas/analytics-filters.schema";

export function useAnalyticsFilters(orgId: string | null) {
  const stored = useAnalyticsStore((s) =>
    orgId ? s.orgStates[orgId] : undefined,
  );
  const setFilters = useAnalyticsStore((s) => s.setFilters);
  const setActiveTab = useAnalyticsStore((s) => s.setActiveTab);
  const resetFilters = useAnalyticsStore((s) => s.resetFilters);

  const orgState = useMemo(() => {
    if (!orgId) return null;
    const defaults = {
      filters: { ...DEFAULT_ANALYTICS_FILTERS },
      activeTab: "waste" as AnalyticsTabId,
    };
    if (!stored) return defaults;
    return {
      ...defaults,
      ...stored,
      filters: { ...defaults.filters, ...stored.filters },
    };
  }, [orgId, stored]);

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
