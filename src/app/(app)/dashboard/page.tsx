"use client";

import { PageHeader } from "@/components/feedback/PageHeader";
import { EmptyOrgDashboard } from "@/features/organizations/components/EmptyOrgDashboard";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function DashboardPage() {
  const { activeOrg, isLoading, isError, refetch } = useOrganizations();

  if (isLoading) return <PageLoadingState />;

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load your organization data."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          activeOrg
            ? `Operational overview for ${activeOrg.name}`
            : "Your mission control for food waste intelligence"
        }
      />
      <EmptyOrgDashboard />
    </div>
  );
}
