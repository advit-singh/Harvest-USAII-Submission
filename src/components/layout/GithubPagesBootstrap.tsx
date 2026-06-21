"use client";

import { useEffect } from "react";
import { isGithubPagesDeployment } from "@/lib/deployment";
import { seedGithubPagesDemoData, DEMO_ORG_ID } from "@/lib/demo/bootstrap";
import { isOnboardingComplete } from "@/lib/demo/onboarding";
import { useOrgStore } from "@/store/org-store";

export function GithubPagesBootstrap() {
  const setActiveOrgId = useOrgStore((state) => state.setActiveOrgId);

  useEffect(() => {
    if (!isGithubPagesDeployment()) return;
    if (!isOnboardingComplete()) return;
    seedGithubPagesDemoData();
    setActiveOrgId(DEMO_ORG_ID);
  }, [setActiveOrgId]);

  return null;
}
