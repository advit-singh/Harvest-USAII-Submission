"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/feedback/PageHeader";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AssistantShell } from "@/features/assistant/components/AssistantShell";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";

function AssistantContent() {
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
        title="AI Assistant"
        description={
          activeOrg
            ? `Natural-language intelligence for ${activeOrg.name}`
            : "Natural-language access to your operational intelligence"
        }
      />
      <AssistantShell orgId={activeOrgId} />
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <AssistantContent />
    </Suspense>
  );
}
