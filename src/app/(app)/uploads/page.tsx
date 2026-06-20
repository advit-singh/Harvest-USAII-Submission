"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/feedback/PageHeader";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { UploadShell } from "@/features/uploads/components/UploadShell";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";

function UploadsContent() {
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
        title="Uploads"
        description={
          activeOrg
            ? `Convert raw operational data into intelligence for ${activeOrg.name}`
            : "Convert raw operational data into intelligence"
        }
      />
      <UploadShell orgId={activeOrgId} />
    </div>
  );
}

export default function UploadsPage() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <UploadsContent />
    </Suspense>
  );
}
