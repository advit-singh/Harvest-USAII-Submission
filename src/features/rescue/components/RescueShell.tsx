"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview } from "@/lib/api/analytics";
import { EmptyOrgDashboard } from "@/features/organizations/components/EmptyOrgDashboard";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RescueToolbar } from "@/features/rescue/components/RescueToolbar";
import { RescueTabNav } from "@/features/rescue/components/RescueTabNav";
import { useRescueFilters } from "@/features/rescue/hooks/useRescueFilters";
import { VALID_RESCUE_TABS } from "@/features/rescue/config/rescue-tabs";
import type { RescueTabId } from "@/types/rescue";

interface RescueShellProps {
  orgId: string | null;
}

export function RescueShell({ orgId }: RescueShellProps) {
  const searchParams = useSearchParams();
  const {
    filters,
    apiFilters,
    recipientFilters,
    historyFilters,
    activeTab,
    selectedOpportunityId,
    selectedRecipientId,
    impactTimeRange,
    updateFilters,
    updateRecipientFilters,
    updateHistoryFilters,
    updateActiveTab,
    selectOpportunity,
    selectRecipient,
    updateImpactTimeRange,
    reset,
  } = useRescueFilters(orgId);

  const tabParam = searchParams.get("tab");
  const idParam = searchParams.get("id");
  const urlTab =
    tabParam && VALID_RESCUE_TABS.includes(tabParam as RescueTabId)
      ? (tabParam as RescueTabId)
      : null;

  useEffect(() => {
    if (urlTab && urlTab !== activeTab && orgId) {
      updateActiveTab(urlTab);
    }
  }, [urlTab, activeTab, orgId, updateActiveTab]);

  useEffect(() => {
    if (idParam && orgId) {
      selectOpportunity(idParam);
      if (activeTab !== "opportunities") {
        updateActiveTab("opportunities");
      }
    }
  }, [idParam, orgId, selectOpportunity, activeTab, updateActiveTab]);

  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview", orgId],
    queryFn: () => fetchDashboardOverview(orgId!),
    enabled: Boolean(orgId),
    staleTime: 300_000,
  });

  if (!orgId || !filters || !apiFilters || !recipientFilters || !historyFilters) {
    return <EmptyOrgDashboard />;
  }

  if (overviewQuery.isLoading) {
    return <PageLoadingState />;
  }

  if (overviewQuery.isError) {
    return (
      <ErrorState
        message="We couldn't load rescue network data."
        onRetry={() => overviewQuery.refetch()}
      />
    );
  }

  if (!overviewQuery.data?.hasOperationalData) {
    return <EmptyOrgDashboard />;
  }

  return (
    <div className="space-y-6">
      <RescueToolbar onResetFilters={reset} />
      <RescueTabNav
        orgId={orgId}
        filters={filters}
        apiFilters={apiFilters}
        recipientFilters={recipientFilters}
        historyFilters={historyFilters}
        activeTab={activeTab}
        selectedOpportunityId={selectedOpportunityId}
        selectedRecipientId={selectedRecipientId}
        impactTimeRange={impactTimeRange}
        initialOpportunityId={idParam}
        onTabChange={updateActiveTab}
        onFiltersChange={updateFilters}
        onRecipientFiltersChange={updateRecipientFilters}
        onHistoryFiltersChange={updateHistoryFilters}
        onSelectOpportunity={selectOpportunity}
        onSelectRecipient={selectRecipient}
        onImpactTimeRangeChange={updateImpactTimeRange}
      />
    </div>
  );
}
