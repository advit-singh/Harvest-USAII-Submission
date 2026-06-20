"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { LucideIcon } from "lucide-react";

interface WidgetQueryStateProps<T> {
  query: UseQueryResult<T>;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: LucideIcon;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

export function WidgetQueryState<T>({
  query,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  isEmpty,
  children,
}: WidgetQueryStateProps<T>) {
  if (query.isLoading) {
    return <LoadingState rows={2} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Unable to load this widget."
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
        className="border-none bg-transparent p-4"
      />
    );
  }

  return <>{children(data)}</>;
}
