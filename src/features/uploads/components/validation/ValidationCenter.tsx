"use client";

import { EmptyState } from "@/components/feedback/EmptyState";
import { AnomalyCard } from "@/features/uploads/components/validation/AnomalyCard";
import { useValidationAnomalies } from "@/features/uploads/hooks/useUploads";
import { UploadQueryState } from "@/features/uploads/components/UploadQueryState";
import type { UploadSummary } from "@/types/upload";
import { ShieldAlert } from "lucide-react";

interface ValidationCenterProps {
  orgId: string;
  uploads: UploadSummary[];
}

export function ValidationCenter({ orgId, uploads }: ValidationCenterProps) {
  const anomaliesQuery = useValidationAnomalies(orgId);

  const uploadMap = new Map(uploads.map((u) => [u.id, u.fileName]));

  return (
    <UploadQueryState
      isLoading={anomaliesQuery.isLoading}
      isError={anomaliesQuery.isError}
      onRetry={() => anomaliesQuery.refetch()}
    >
      {!anomaliesQuery.data?.length ? (
        <EmptyState
          icon={ShieldAlert}
          title="No validation issues"
          description="Detected anomalies from uploads will appear here for review."
        />
      ) : (
        <div className="space-y-4" role="list" aria-label="Validation anomalies">
          {anomaliesQuery.data.map((anomaly) => (
            <div key={anomaly.id} role="listitem">
              <AnomalyCard
                anomaly={anomaly}
                fileName={uploadMap.get(anomaly.uploadId)}
                orgId={orgId}
              />
            </div>
          ))}
        </div>
      )}
    </UploadQueryState>
  );
}
