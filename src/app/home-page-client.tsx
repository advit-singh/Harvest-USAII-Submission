"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoadingState } from "@/components/feedback/LoadingState";

const DEV_SESSION_KEY = "harvest-dev-session";

function hasDevSession(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(DEV_SESSION_KEY));
}

export function HomePageClient() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasDevSession() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoadingState />
    </div>
  );
}
