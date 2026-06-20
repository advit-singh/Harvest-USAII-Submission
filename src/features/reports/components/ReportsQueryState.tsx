"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";
import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";

interface ReportsQueryStateProps<T> {
  query: UseQueryResult<T>;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}

export function ReportsQueryState<T>({
  query,
  emptyTitle = "No reports yet",
  emptyDescription = "Generate a report from a template to get started.",
  emptyIcon = FileText,
  isEmpty,
  children,
}: ReportsQueryStateProps<T>) {
  if (query.isLoading) {
    return <LoadingState rows={4} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Unable to load reports."
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
