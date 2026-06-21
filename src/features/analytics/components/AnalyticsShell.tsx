"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnalyticsToolbar } from "@/features/analytics/components/AnalyticsToolbar";
import { AnalyticsTabNav } from "@/features/analytics/components/AnalyticsTabNav";
import { useAnalyticsFilters } from "@/features/analytics/hooks/useAnalyticsFilters";
import { analyticsKeys } from "@/features/analytics/hooks/analytics-keys";
import { fetchDashboardOverview } from "@/lib/api/analytics";
import { useQuery } from "@tanstack/react-query";
import { EmptyOrgDashboard } from "@/features/organizations/components/EmptyOrgDashboard";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import type { AnalyticsTabId } from "@/types/analytics";

const VALID_TABS: AnalyticsTabId[] = [
  "waste",
  "inventory",
  "attendance",
  "donations",
  "impact",
];

interface AnalyticsShellProps {
  orgId: string | null;
}

export function AnalyticsShell({ orgId }: AnalyticsShellProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const {
    filters,
    apiFilters,
    activeTab,
    updateFilters,
    updateActiveTab,
    reset,
  } = useAnalyticsFilters(orgId);

  const tabParam = searchParams.get("tab");
  const urlTab =
    tabParam && VALID_TABS.includes(tabParam as AnalyticsTabId)
      ? (tabParam as AnalyticsTabId)
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
    void queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
  }, [orgId, queryClient]);

  if (!orgId || !filters || !apiFilters) {
    return <EmptyOrgDashboard />;
  }

  if (overviewQuery.isLoading) {
    return <PageLoadingState />;
  }

  if (overviewQuery.isError) {
    return (
      <ErrorState
        message="We couldn't load analytics."
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
      <AnalyticsToolbar
        orgId={orgId}
        filters={filters}
        onFiltersChange={updateFilters}
        onReset={reset}
      />
      <AnalyticsTabNav
        orgId={orgId}
        filters={apiFilters}
        activeTab={urlTab ?? activeTab}
        onTabChange={updateActiveTab}
      />
    </div>
  );
}
