"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PREDICTIONS_TABS } from "@/features/predictions/config/predictions-tabs";
import { ForecastSummaryGrid } from "@/features/predictions/components/summary/ForecastSummaryGrid";
import { ForecastExplorerSection } from "@/features/predictions/components/explorer/ForecastExplorerSection";
import { RecommendationsSection } from "@/features/predictions/components/recommendations/RecommendationsSection";
import { ScenarioSimulatorShell } from "@/features/predictions/components/simulator/ScenarioSimulatorShell";
import type { PredictionsFilters } from "@/types/predictions";
import type { PredictionsTabId } from "@/types/predictions";
import type { PredictionsFiltersInput } from "@/features/predictions/schemas/predictions-filters.schema";
import type { RecommendationFiltersInput } from "@/features/predictions/schemas/recommendation-filters.schema";

interface PredictionsTabNavProps {
  orgId: string;
  filters: PredictionsFilters;
  filterInput: PredictionsFiltersInput;
  recommendationFilters: RecommendationFiltersInput;
  activeTab: PredictionsTabId;
  onTabChange: (tab: PredictionsTabId) => void;
  onFiltersChange: (partial: Partial<PredictionsFiltersInput>) => void;
  onRecommendationFiltersChange: (
    partial: Partial<RecommendationFiltersInput>,
  ) => void;
}

export function PredictionsTabNav({
  orgId,
  filters,
  filterInput,
  recommendationFilters,
  activeTab,
  onTabChange,
  onFiltersChange,
  onRecommendationFiltersChange,
}: PredictionsTabNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as PredictionsTabId;
      onTabChange(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`/predictions?${params.toString()}`, { scroll: false });
    },
    [onTabChange, router, searchParams],
  );

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        {PREDICTIONS_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5"
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="summary">
        <ForecastSummaryGrid orgId={orgId} />
      </TabsContent>

      <TabsContent value="explorer">
        <ForecastExplorerSection
          orgId={orgId}
          filters={filters}
          filterInput={filterInput}
          onFiltersChange={onFiltersChange}
        />
      </TabsContent>

      <TabsContent value="recommendations">
        <RecommendationsSection
          orgId={orgId}
          filters={recommendationFilters}
          onFiltersChange={onRecommendationFiltersChange}
        />
      </TabsContent>

      <TabsContent value="simulator">
        <ScenarioSimulatorShell orgId={orgId} />
      </TabsContent>
    </Tabs>
  );
}
