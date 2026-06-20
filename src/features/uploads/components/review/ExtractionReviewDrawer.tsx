"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AiBadge } from "@/components/ai/AiBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { OriginalContentPanel } from "@/features/uploads/components/review/OriginalContentPanel";
import { ExtractedEntitiesTable } from "@/features/uploads/components/review/ExtractedEntitiesTable";
import { ReviewActionBar } from "@/features/uploads/components/review/ReviewActionBar";
import { AnomalyCard } from "@/features/uploads/components/validation/AnomalyCard";
import { useUploadReview } from "@/features/uploads/hooks/useUploads";
import type { UploadReview } from "@/types/upload";

interface ExtractionReviewDrawerProps {
  orgId: string;
  uploadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReviewContentProps {
  orgId: string;
  uploadId: string;
  review: UploadReview;
  onSuccess: () => void;
}

function ReviewContent({ orgId, uploadId, review, onSuccess }: ReviewContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [entityValues, setEntityValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {};
    for (const entity of review.extractedEntities) {
      values[entity.id] = entity.value;
    }
    return values;
  });

  return (
    <>
      <ConfidenceIndicator
        value={Math.round(review.overallConfidence * 100)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <OriginalContentPanel
          content={review.originalContent}
          contentType={review.originalContentType}
          fileName={review.fileName}
        />
        <ExtractedEntitiesTable
          entities={review.extractedEntities}
          editable={isEditing}
          values={entityValues}
          onValueChange={(id, value) =>
            setEntityValues((prev) => ({ ...prev, [id]: value }))
          }
        />
      </div>

      {review.validationIssues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Validation issues</h3>
          {review.validationIssues.map((anomaly) => (
            <AnomalyCard
              key={anomaly.id}
              anomaly={anomaly}
              orgId={orgId}
            />
          ))}
        </div>
      )}

      <ReviewActionBar
        uploadId={uploadId}
        entities={review.extractedEntities}
        entityValues={entityValues}
        onSuccess={onSuccess}
        onEditModeChange={setIsEditing}
        isEditing={isEditing}
      />
    </>
  );
}

export function ExtractionReviewDrawer({
  orgId,
  uploadId,
  open,
  onOpenChange,
}: ExtractionReviewDrawerProps) {
  const reviewQuery = useUploadReview(open ? uploadId : null);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            Extraction review
            <AiBadge />
          </DrawerTitle>
          {reviewQuery.data && (
            <p className="text-sm text-muted-foreground">
              {reviewQuery.data.fileName} ·{" "}
              {reviewQuery.data.classification.replace(/_/g, " ")}
            </p>
          )}
        </DrawerHeader>

        <div className="space-y-4 overflow-y-auto px-4 pb-6">
          {reviewQuery.isLoading ? (
            <LoadingState rows={4} />
          ) : reviewQuery.isError ? (
            <ErrorState
              message="Unable to load extraction review."
              onRetry={() => reviewQuery.refetch()}
            />
          ) : reviewQuery.data && uploadId ? (
            <ReviewContent
              key={uploadId}
              orgId={orgId}
              uploadId={uploadId}
              review={reviewQuery.data}
              onSuccess={handleSuccess}
            />
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
