"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { LucideIcon } from "lucide-react";
import { BarChart3 } from "lucide-react";

interface AnalyticsQueryStateProps<T> {
  query: UseQueryResult<T>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

export function AnalyticsQueryState<T>({
  query,
  emptyTitle = "No analytics data yet",
  emptyDescription = "Upload operational data to see analytics insights.",
  emptyIcon = BarChart3,
  isEmpty,
  children,
}: AnalyticsQueryStateProps<T>) {
  if (query.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Unable to load analytics data."
        onRetry={() => query.refetch()}
      />
    );
  }

  const data = query.data;
  if (data === undefined || (isEmpty && isEmpty(data))) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return <>{children(data)}</>;
}
