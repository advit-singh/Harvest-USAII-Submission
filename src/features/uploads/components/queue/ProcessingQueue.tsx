"use client";

import { EmptyState } from "@/components/feedback/EmptyState";
import { UploadQueueCard } from "@/features/uploads/components/queue/UploadQueueCard";
import { isQueueStatus } from "@/features/uploads/config/upload-tabs";
import type { UploadSummary } from "@/types/upload";
import { Clock } from "lucide-react";

interface ProcessingQueueProps {
  uploads: UploadSummary[];
  onReview: (id: string) => void;
}

export function ProcessingQueue({ uploads, onReview }: ProcessingQueueProps) {
  const queueItems = uploads.filter(
    (u) => isQueueStatus(u.status) && u.status !== "completed",
  );

  if (queueItems.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No uploads in progress"
        description="Files you upload will appear here while they are being processed."
      />
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Processing queue">
      {queueItems.map((upload) => (
        <div key={upload.id} role="listitem">
          <UploadQueueCard upload={upload} onReview={onReview} />
        </div>
      ))}
    </div>
  );
}
