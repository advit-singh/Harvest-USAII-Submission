"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const REFRESH_MS = 30_000;

/** Periodically invalidates queries so mock data feels live across the app. */
export function LiveDataSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    const id = window.setInterval(() => {
      void queryClient.invalidateQueries();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [queryClient]);

  return null;
}
