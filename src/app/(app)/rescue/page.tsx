"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/feedback/PageHeader";
import { RescueShell } from "@/features/rescue/components/RescueShell";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";

function RescueContent() {
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
        title="Rescue Network"
        description={
          activeOrg
            ? `Manage surplus redistribution for ${activeOrg.name}`
            : "Review donation opportunities, match recipients, and track outcomes"
        }
      />
      <RescueShell orgId={activeOrgId} />
    </div>
  );
}

export default function RescuePage() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <RescueContent />
    </Suspense>
  );
}
