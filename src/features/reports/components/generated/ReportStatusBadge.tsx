"use client";

import type { ReportStatus } from "@/types/report";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ReportStatus, string> = {
  queued: "Queued",
  generating: "Generating",
  ready: "Ready",
  failed: "Failed",
};

const STATUS_VARIANT: Record<
  ReportStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  queued: "secondary",
  generating: "outline",
  ready: "default",
  failed: "destructive",
};

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export function ReportStatusBadge({ status, className }: ReportStatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      className={cn(
        status === "generating" && "animate-pulse",
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
