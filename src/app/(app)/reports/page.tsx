"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/feedback/PageHeader";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ReportsShell } from "@/features/reports/components/ReportsShell";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";

function ReportsContent() {
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
        title="Reports"
        description={
          activeOrg
            ? `Generate organizational reporting for ${activeOrg.name}`
            : "Generate organizational reporting and exports"
        }
      />
      <ReportsShell orgId={activeOrgId} />
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <ReportsContent />
    </Suspense>
  );
}
