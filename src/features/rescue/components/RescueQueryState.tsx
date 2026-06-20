"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { LucideIcon } from "lucide-react";
import { HeartHandshake } from "lucide-react";

interface RescueQueryStateProps<T> {
  query: UseQueryResult<T>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

export function RescueQueryState<T>({
  query,
  emptyTitle = "No rescue data yet",
  emptyDescription = "Donation opportunities appear when surplus is detected.",
  emptyIcon = HeartHandshake,
  isEmpty,
  children,
}: RescueQueryStateProps<T>) {
  if (query.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Unable to load rescue network data."
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
