"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { isOnboardingComplete } from "@/lib/demo/onboarding";
import { PageLoadingState } from "@/components/feedback/LoadingState";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && pathname !== "/onboarding") {
      router.replace(isOnboardingComplete() ? "/dashboard" : "/onboarding");
    }
  }, [loading, isAuthenticated, pathname, router]);

  if (loading) return <PageLoadingState />;
  if (isAuthenticated) return <PageLoadingState />;

  return <>{children}</>;
}
