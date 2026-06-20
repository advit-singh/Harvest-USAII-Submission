"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadStageBadge } from "@/features/uploads/components/queue/UploadStageBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import type { UploadSummary } from "@/types/upload";

interface UploadQueueCardProps {
  upload: UploadSummary;
  onReview?: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadQueueCard({ upload, onReview }: UploadQueueCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-medium">{upload.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(upload.fileSize)} · {upload.classification.replace(/_/g, " ")}
            </p>
          </div>
          <UploadStageBadge status={upload.status} />
        </div>

        <Progress value={upload.progress} aria-label={`Processing progress ${upload.progress}%`} />

        {upload.confidence > 0 && (
          <ConfidenceIndicator value={Math.round(upload.confidence * 100)} />
        )}

        {upload.status === "review_required" && onReview && (
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => onReview(upload.id)}
          >
            Review extraction →
          </button>
        )}

        {upload.failureReason && (
          <p className="text-sm text-destructive">{upload.failureReason}</p>
        )}
      </CardContent>
    </Card>
  );
}
