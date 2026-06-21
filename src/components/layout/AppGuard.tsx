"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { isOnboardingComplete } from "@/lib/demo/onboarding";
import { PageLoadingState } from "@/components/feedback/LoadingState";

export function AppGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isOnboardingComplete() && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [authLoading, isAuthenticated, pathname, router]);

  if (authLoading) {
    return <PageLoadingState />;
  }

  if (!isAuthenticated) {
    return <PageLoadingState />;
  }

  if (!isOnboardingComplete()) {
    return <PageLoadingState />;
  }

  return <>{children}</>;
}
