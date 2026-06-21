"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { isOnboardingComplete } from "@/lib/demo/onboarding";
import { OnboardingWizard } from "@/features/organizations/components/OnboardingWizard";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import { HarvestLogo } from "@/components/brand/HarvestLogo";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
    if (!authLoading && isAuthenticated && isOnboardingComplete()) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <PageLoadingState />
      </div>
    );
  }

  if (!isAuthenticated || isOnboardingComplete()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <PageLoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <HarvestLogo size={36} className="mb-2" />
        <h1 className="text-2xl font-bold text-primary">Harvest</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let&apos;s set up your organization
        </p>
      </div>
      <OnboardingWizard />
    </div>
  );
}
