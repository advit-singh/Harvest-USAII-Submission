"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { OnboardingWizard } from "@/features/organizations/components/OnboardingWizard";
import { PageLoadingState } from "@/components/feedback/LoadingState";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
    if (!orgsLoading && organizations.length > 0) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, orgsLoading, organizations.length, router]);

  if (authLoading || orgsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <PageLoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-primary">Project Harvest</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let&apos;s set up your organization
        </p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
