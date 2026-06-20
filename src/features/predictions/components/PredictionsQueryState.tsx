"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";

interface PredictionsQueryStateProps<T> {
  query: UseQueryResult<T>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

export function PredictionsQueryState<T>({
  query,
  emptyTitle = "No forecast data yet",
  emptyDescription = "Generate forecasts after uploading operational data.",
  emptyIcon = TrendingUp,
  isEmpty,
  children,
}: PredictionsQueryStateProps<T>) {
  if (query.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Unable to load predictions data."
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
