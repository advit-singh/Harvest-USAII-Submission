"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import { PageLoadingState } from "@/components/feedback/LoadingState";

interface AssistantQueryStateProps {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function AssistantQueryState({
  isLoading,
  isError,
  onRetry,
  children,
}: AssistantQueryStateProps) {
  if (isLoading) {
    return <PageLoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load this conversation."
        onRetry={onRetry}
      />
    );
  }

  return <>{children}</>;
}
