"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/feedback/PageHeader";
import { SettingsShell } from "@/features/settings/components/SettingsShell";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";

function SettingsContent() {
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
        title="Settings"
        description={
          activeOrg
            ? `Configure ${activeOrg.name}`
            : "Configure organization, users, permissions, and preferences"
        }
      />
      <SettingsShell orgId={activeOrgId} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <SettingsContent />
    </Suspense>
  );
}
