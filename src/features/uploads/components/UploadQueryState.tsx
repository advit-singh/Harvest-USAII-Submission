"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";

interface UploadQueryStateProps {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function UploadQueryState({
  isLoading,
  isError,
  onRetry,
  children,
}: UploadQueryStateProps) {
  if (isLoading) return <LoadingState rows={4} />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load upload data."
        onRetry={onRetry}
      />
    );
  }
  return <>{children}</>;
}
