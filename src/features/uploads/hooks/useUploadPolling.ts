"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadKeys } from "@/features/uploads/hooks/useUploads";
import type { UploadSummary } from "@/types/upload";
import { isProcessingUploadStatus } from "@/types/upload";

const POLL_INTERVAL_MS = 2000;

export function useUploadPolling(
  orgId: string | null,
  uploads: UploadSummary[] | undefined,
  enabled: boolean,
): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !orgId || !uploads?.length) return;

    const hasProcessing = uploads.some((u) => isProcessingUploadStatus(u.status));
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.all });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, orgId, uploads, queryClient]);
}
