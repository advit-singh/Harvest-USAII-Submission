"use client";

import { usePredictionsStore } from "@/store/predictions-store";
import { toPredictionsFilters } from "@/features/predictions/config/predictions-tabs";
import type { PredictionsTabId } from "@/types/predictions";
import type { PredictionsFiltersInput } from "@/features/predictions/schemas/predictions-filters.schema";
import type { RecommendationFiltersInput } from "@/features/predictions/schemas/recommendation-filters.schema";

export function usePredictionsFilters(orgId: string | null) {
  const getStateForOrg = usePredictionsStore((s) => s.getStateForOrg);
  const setFilters = usePredictionsStore((s) => s.setFilters);
  const setRecommendationFilters = usePredictionsStore(
    (s) => s.setRecommendationFilters,
  );
  const setActiveTab = usePredictionsStore((s) => s.setActiveTab);
  const resetFilters = usePredictionsStore((s) => s.resetFilters);

  const orgState = orgId ? getStateForOrg(orgId) : null;
  const filters = orgState?.filters ?? null;
  const recommendationFilters = orgState?.recommendationFilters ?? null;
  const activeTab = orgState?.activeTab ?? "summary";

  const updateFilters = (partial: Partial<PredictionsFiltersInput>) => {
    if (!orgId) return;
    setFilters(orgId, partial);
  };

  const updateRecommendationFilters = (
    partial: Partial<RecommendationFiltersInput>,
  ) => {
    if (!orgId) return;
    setRecommendationFilters(orgId, partial);
  };

  const updateActiveTab = (tab: PredictionsTabId) => {
    if (!orgId) return;
    setActiveTab(orgId, tab);
  };

  const reset = () => {
    if (!orgId) return;
    resetFilters(orgId);
  };

  const apiFilters = filters ? toPredictionsFilters(filters) : null;

  return {
    filters,
    apiFilters,
    recommendationFilters,
    activeTab,
    updateFilters,
    updateRecommendationFilters,
    updateActiveTab,
    reset,
  };
}
