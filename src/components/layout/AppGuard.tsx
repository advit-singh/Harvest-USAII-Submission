"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { PageLoadingState } from "@/components/feedback/LoadingState";

export function AppGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!orgsLoading && organizations.length === 0 && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [
    authLoading,
    isAuthenticated,
    orgsLoading,
    organizations.length,
    pathname,
    router,
  ]);

  if (authLoading || orgsLoading) {
    return <PageLoadingState />;
  }

  if (!isAuthenticated) {
    return <PageLoadingState />;
  }

  if (organizations.length === 0) {
    return <PageLoadingState />;
  }

  return <>{children}</>;
}
