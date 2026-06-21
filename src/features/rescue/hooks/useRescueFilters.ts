"use client";

import { useMemo } from "react";
import { useRescueStore } from "@/store/rescue-store";
import { toRescueFilters } from "@/features/rescue/config/rescue-tabs";
import {
  DEFAULT_DONATION_HISTORY_FILTERS,
  DEFAULT_RECIPIENT_FILTERS,
  DEFAULT_RESCUE_FILTERS,
  type DonationHistoryFiltersInput,
  type RecipientFiltersInput,
  type RescueFiltersInput,
} from "@/features/rescue/schemas/rescue-filters.schema";
import type { RescueTabId } from "@/types/rescue";

export function useRescueFilters(orgId: string | null) {
  const stored = useRescueStore((s) => (orgId ? s.orgStates[orgId] : undefined));
  const setFilters = useRescueStore((s) => s.setFilters);
  const setRecipientFilters = useRescueStore((s) => s.setRecipientFilters);
  const setHistoryFilters = useRescueStore((s) => s.setHistoryFilters);
  const setActiveTab = useRescueStore((s) => s.setActiveTab);
  const setSelectedOpportunityId = useRescueStore(
    (s) => s.setSelectedOpportunityId,
  );
  const setSelectedRecipientId = useRescueStore((s) => s.setSelectedRecipientId);
  const setImpactTimeRange = useRescueStore((s) => s.setImpactTimeRange);
  const resetFilters = useRescueStore((s) => s.resetFilters);

  const orgState = useMemo(() => {
    if (!orgId) return null;
    const defaults = {
      filters: { ...DEFAULT_RESCUE_FILTERS },
      recipientFilters: { ...DEFAULT_RECIPIENT_FILTERS },
      historyFilters: { ...DEFAULT_DONATION_HISTORY_FILTERS },
      activeTab: "opportunities" as RescueTabId,
      selectedOpportunityId: null as string | null,
      selectedRecipientId: null as string | null,
      impactTimeRange: "week" as const,
    };
    if (!stored) return defaults;
    return {
      ...defaults,
      ...stored,
      filters: { ...defaults.filters, ...stored.filters },
      recipientFilters: {
        ...defaults.recipientFilters,
        ...stored.recipientFilters,
      },
      historyFilters: {
        ...defaults.historyFilters,
        ...stored.historyFilters,
      },
    };
  }, [orgId, stored]);

  const updateFilters = (partial: Partial<RescueFiltersInput>) => {
    if (!orgId) return;
    setFilters(orgId, partial);
  };

  const updateRecipientFilters = (partial: Partial<RecipientFiltersInput>) => {
    if (!orgId) return;
    setRecipientFilters(orgId, partial);
  };

  const updateHistoryFilters = (
    partial: Partial<DonationHistoryFiltersInput>,
  ) => {
    if (!orgId) return;
    setHistoryFilters(orgId, partial);
  };

  const updateActiveTab = (tab: RescueTabId) => {
    if (!orgId) return;
    setActiveTab(orgId, tab);
  };

  const selectOpportunity = (id: string | null) => {
    if (!orgId) return;
    setSelectedOpportunityId(orgId, id);
  };

  const selectRecipient = (id: string | null) => {
    if (!orgId) return;
    setSelectedRecipientId(orgId, id);
  };

  const updateImpactTimeRange = (
    range: "week" | "month" | "quarter" | "year",
  ) => {
    if (!orgId) return;
    setImpactTimeRange(orgId, range);
  };

  const reset = () => {
    if (!orgId) return;
    resetFilters(orgId);
  };

  const apiFilters = orgState?.filters
    ? toRescueFilters(orgState.filters)
    : null;

  return {
    filters: orgState?.filters ?? null,
    apiFilters,
    recipientFilters: orgState?.recipientFilters ?? null,
    historyFilters: orgState?.historyFilters ?? null,
    activeTab: orgState?.activeTab ?? "opportunities",
    selectedOpportunityId: orgState?.selectedOpportunityId ?? null,
    selectedRecipientId: orgState?.selectedRecipientId ?? null,
    impactTimeRange: orgState?.impactTimeRange ?? "week",
    updateFilters,
    updateRecipientFilters,
    updateHistoryFilters,
    updateActiveTab,
    selectOpportunity,
    selectRecipient,
    updateImpactTimeRange,
    reset,
  };
}
