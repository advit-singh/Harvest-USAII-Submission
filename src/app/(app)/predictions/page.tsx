"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/feedback/PageHeader";
import { PredictionsShell } from "@/features/predictions/components/PredictionsShell";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";

function PredictionsContent() {
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
        title="Predictions"
        description={
          activeOrg
            ? `Forecasts and recommendations for ${activeOrg.name}`
            : "Prevent waste before it occurs with forecasts and recommendations"
        }
      />
      <PredictionsShell orgId={activeOrgId} />
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <PredictionsContent />
    </Suspense>
  );
}
