"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardGrid } from "@/features/dashboard/components/DashboardGrid";
import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";
import { dashboardKeys } from "@/features/dashboard/hooks/useDashboardOverview";
import { forecastKeys } from "@/features/dashboard/hooks/useForecasts";
import { recommendationKeys } from "@/features/dashboard/hooks/useRecommendations";
import { impactKeys } from "@/features/dashboard/hooks/useImpactMetrics";
import { inventoryKeys } from "@/features/dashboard/hooks/useInventoryHealth";
import { donationKeys } from "@/features/dashboard/hooks/useDonationOpportunities";
import { activityKeys } from "@/features/dashboard/hooks/useRecentActivity";
import { EmptyOrgDashboard } from "@/features/organizations/components/EmptyOrgDashboard";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";

interface DashboardShellProps {
  orgId: string | null;
}

export function DashboardShell({ orgId }: DashboardShellProps) {
  const queryClient = useQueryClient();
  const overviewQuery = useDashboardOverview(orgId);

  useEffect(() => {
    if (!orgId) return;
    void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    void queryClient.invalidateQueries({ queryKey: forecastKeys.all });
    void queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
    void queryClient.invalidateQueries({ queryKey: impactKeys.all });
    void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    void queryClient.invalidateQueries({ queryKey: donationKeys.all });
    void queryClient.invalidateQueries({ queryKey: activityKeys.all });
  }, [orgId, queryClient]);

  if (!orgId) {
    return <EmptyOrgDashboard />;
  }

  if (overviewQuery.isLoading) {
    return <PageLoadingState />;
  }

  if (overviewQuery.isError) {
    return (
      <ErrorState
        message="We couldn't load your dashboard."
        onRetry={() => overviewQuery.refetch()}
      />
    );
  }

  const hasData = overviewQuery.data?.hasOperationalData ?? false;

  if (!hasData) {
    return <EmptyOrgDashboard />;
  }

  return <DashboardGrid orgId={orgId} />;
}
