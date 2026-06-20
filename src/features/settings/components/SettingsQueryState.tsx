"use client";

import type { ReactNode } from "react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageLoadingState } from "@/components/feedback/LoadingState";
import type { UseQueryResult } from "@tanstack/react-query";

interface SettingsQueryStateProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}

export function SettingsQueryState<T>({
  query,
  children,
}: SettingsQueryStateProps<T>) {
  if (query.isLoading) {
    return <PageLoadingState />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="We couldn't load this settings section."
        onRetry={() => query.refetch()}
      />
    );
  }

  if (query.data === undefined) {
    return null;
  }

  return <>{children(query.data)}</>;
}
