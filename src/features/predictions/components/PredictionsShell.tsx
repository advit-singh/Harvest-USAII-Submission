"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { PredictionsToolbar } from "@/features/predictions/components/PredictionsToolbar";
import { PredictionsTabNav } from "@/features/predictions/components/PredictionsTabNav";
import { usePredictionsFilters } from "@/features/predictions/hooks/usePredictionsFilters";
import { predictionsKeys } from "@/features/predictions/hooks/predictions-keys";
import { forecastKeys, recommendationKeys } from "@/features/predictions/hooks/predictions-keys";
import { fetchDashboardOverview } from "@/lib/api/analytics";
import { EmptyOrgDashboard } from "@/features/organizations/components/EmptyOrgDashboard";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { PredictionsTabId } from "@/types/predictions";

const VALID_TABS: PredictionsTabId[] = [
  "summary",
  "explorer",
  "recommendations",
  "simulator",
];

interface PredictionsShellProps {
  orgId: string | null;
}

export function PredictionsShell({ orgId }: PredictionsShellProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const {
    filters,
    apiFilters,
    recommendationFilters,
    activeTab,
    updateFilters,
    updateRecommendationFilters,
    updateActiveTab,
    reset,
  } = usePredictionsFilters(orgId);

  const tabParam = searchParams.get("tab");
  const urlTab =
    tabParam && VALID_TABS.includes(tabParam as PredictionsTabId)
      ? (tabParam as PredictionsTabId)
      : null;

  useEffect(() => {
    if (urlTab && urlTab !== activeTab && orgId) {
      updateActiveTab(urlTab);
    }
  }, [urlTab, activeTab, orgId, updateActiveTab]);

  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview", orgId],
    queryFn: () => fetchDashboardOverview(orgId!),
    enabled: Boolean(orgId),
    staleTime: 300_000,
  });

  useEffect(() => {
    if (!orgId) return;
    void queryClient.invalidateQueries({ queryKey: predictionsKeys.all });
    void queryClient.invalidateQueries({ queryKey: forecastKeys.all });
    void queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
  }, [orgId, queryClient]);

  if (!orgId || !filters || !apiFilters || !recommendationFilters) {
    return <EmptyOrgDashboard />;
  }

  if (overviewQuery.isLoading) {
    return <PageLoadingState />;
  }

  if (overviewQuery.isError) {
    return (
      <ErrorState
        message="We couldn't load predictions."
        onRetry={() => overviewQuery.refetch()}
      />
    );
  }

  const hasData = overviewQuery.data?.hasOperationalData ?? false;

  if (!hasData) {
    return <EmptyOrgDashboard />;
  }

  return (
    <div className="space-y-6">
      <PredictionsToolbar
        orgId={orgId}
        filters={filters}
        onFiltersChange={updateFilters}
        onReset={reset}
      />
      <PredictionsTabNav
        orgId={orgId}
        filters={apiFilters}
        filterInput={filters}
        recommendationFilters={recommendationFilters}
        activeTab={urlTab ?? activeTab}
        onTabChange={updateActiveTab}
        onFiltersChange={updateFilters}
        onRecommendationFiltersChange={updateRecommendationFilters}
      />
    </div>
  );
}
