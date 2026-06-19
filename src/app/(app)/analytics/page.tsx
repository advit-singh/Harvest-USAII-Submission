"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/feedback/PageHeader";
import { AnalyticsShell } from "@/features/analytics/components/AnalyticsShell";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";

function AnalyticsContent() {
  const { activeOrg, activeOrgId, isLoading, isError, refetch } =
    useOrganizations();

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
        title="Analytics"
        description={
          activeOrg
            ? `Historical operations for ${activeOrg.name}`
            : "Understand historical operations and waste patterns"
        }
      />
      <AnalyticsShell orgId={activeOrgId} />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <AnalyticsContent />
    </Suspense>
  );
}
