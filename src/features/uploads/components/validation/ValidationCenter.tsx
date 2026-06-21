"use client";

import { useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { AnomalyCard } from "@/features/uploads/components/validation/AnomalyCard";
import { useValidationAnomalies } from "@/features/uploads/hooks/useUploads";
import { UploadQueryState } from "@/features/uploads/components/UploadQueryState";
import type { UploadSummary } from "@/types/upload";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchValidationAnomalies } from "@/lib/api/uploads";
import { uploadKeys } from "@/features/uploads/hooks/useUploads";

interface ValidationCenterProps {
  orgId: string;
  uploads: UploadSummary[];
}

export function ValidationCenter({ orgId, uploads }: ValidationCenterProps) {
  const [view, setView] = useState<"open" | "resolved">("open");
  const anomaliesQuery = useValidationAnomalies(orgId);
  const resolvedQuery = useQuery({
    queryKey: [...uploadKeys.anomalies(orgId), "resolved"],
    queryFn: () => fetchValidationAnomalies(orgId, "resolved"),
  });

  const uploadMap = new Map(uploads.map((u) => [u.id, u.fileName]));
  const activeQuery = view === "open" ? anomaliesQuery : resolvedQuery;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={view === "open" ? "default" : "outline"}
          onClick={() => setView("open")}
        >
          Open issues
        </Button>
        <Button
          size="sm"
          variant={view === "resolved" ? "default" : "outline"}
          onClick={() => setView("resolved")}
        >
          Resolved
        </Button>
      </div>

      <UploadQueryState
        isLoading={activeQuery.isLoading}
        isError={activeQuery.isError}
        onRetry={() => activeQuery.refetch()}
      >
        {!activeQuery.data?.length ? (
          <EmptyState
            icon={view === "open" ? ShieldAlert : ShieldCheck}
            title={view === "open" ? "No validation issues" : "No resolved issues"}
            description={
              view === "open"
                ? "Detected anomalies from uploads will appear here for review."
                : "Acknowledged and corrected anomalies appear here."
            }
          />
        ) : (
          <div className="space-y-4" role="list" aria-label="Validation anomalies">
            {activeQuery.data.map((anomaly) => (
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
    </div>
  );
}
