"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <ErrorState
        message="Something went wrong loading this page."
        onRetry={reset}
      />
    </div>
  );
}
