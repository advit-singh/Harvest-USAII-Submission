"use client";

import { useMemo } from "react";
import { usePredictionsStore } from "@/store/predictions-store";
import { toPredictionsFilters } from "@/features/predictions/config/predictions-tabs";
import {
  DEFAULT_PREDICTIONS_FILTERS,
  type PredictionsFiltersInput,
} from "@/features/predictions/schemas/predictions-filters.schema";
import {
  DEFAULT_RECOMMENDATION_FILTERS,
  type RecommendationFiltersInput,
} from "@/features/predictions/schemas/recommendation-filters.schema";
import { DEFAULT_SIMULATION_INPUT } from "@/features/predictions/schemas/simulation-input.schema";
import type { PredictionsTabId } from "@/types/predictions";

export function usePredictionsFilters(orgId: string | null) {
  const stored = usePredictionsStore((s) =>
    orgId ? s.orgStates[orgId] : undefined,
  );
  const setFilters = usePredictionsStore((s) => s.setFilters);
  const setRecommendationFilters = usePredictionsStore(
    (s) => s.setRecommendationFilters,
  );
  const setActiveTab = usePredictionsStore((s) => s.setActiveTab);
  const resetFilters = usePredictionsStore((s) => s.resetFilters);

  const orgState = useMemo(() => {
    if (!orgId) return null;
    const defaults = {
      filters: { ...DEFAULT_PREDICTIONS_FILTERS },
      recommendationFilters: { ...DEFAULT_RECOMMENDATION_FILTERS },
      activeTab: "summary" as PredictionsTabId,
      selectedForecastId: null as string | null,
      simulatorDraft: { ...DEFAULT_SIMULATION_INPUT },
      savedScenarioIds: [] as string[],
      compareScenarioIds: [] as string[],
    };
    if (!stored) return defaults;
    return {
      ...defaults,
      ...stored,
      filters: { ...defaults.filters, ...stored.filters },
      recommendationFilters: {
        ...defaults.recommendationFilters,
        ...stored.recommendationFilters,
      },
      simulatorDraft: {
        ...defaults.simulatorDraft,
        ...stored.simulatorDraft,
      },
    };
  }, [orgId, stored]);

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
