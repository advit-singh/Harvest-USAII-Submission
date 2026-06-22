"use client";

import { useEffect } from "react";
import { isGithubPagesDeployment } from "@/lib/deployment";
import { seedGithubPagesDemoData } from "@/lib/demo/bootstrap";
import { isOnboardingComplete } from "@/lib/demo/onboarding";

export function GithubPagesBootstrap() {
  useEffect(() => {
    if (!isGithubPagesDeployment()) return;
    if (!isOnboardingComplete()) return;
    seedGithubPagesDemoData();
  }, []);

  return null;
}
