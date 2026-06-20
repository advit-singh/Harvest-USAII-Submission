"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/features/uploads/config/upload-stages";
import type { UploadStatus } from "@/types/upload";

interface UploadStageBadgeProps {
  status: UploadStatus;
}

const STATUS_VARIANT: Record<
  UploadStatus,
  "default" | "secondary" | "destructive" | "warning" | "ai" | "success"
> = {
  uploaded: "secondary",
  classifying: "ai",
  extracting: "ai",
  normalizing: "ai",
  validating: "ai",
  review_required: "warning",
  completed: "success",
  failed: "destructive",
  rejected: "destructive",
};

export function UploadStageBadge({ status }: UploadStageBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
