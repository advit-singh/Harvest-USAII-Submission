"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveUpload,
  fetchUploadReview,
  fetchUploads,
  fetchUploadStatus,
  fetchValidationAnomalies,
  rejectUpload,
  resolveValidationAnomaly,
  triggerUploadProcess,
  uploadFile,
  type UploadFileInput,
} from "@/lib/api/uploads";
import type { ApproveUploadPayload, RejectUploadPayload, UploadFilters } from "@/types/upload";
import { isProcessingUploadStatus } from "@/types/upload";

export const uploadKeys = {
  all: ["uploads"] as const,
  list: (filters: UploadFilters) =>
    [...uploadKeys.all, "list", filters] as const,
  detail: (id: string) => [...uploadKeys.all, "detail", id] as const,
  review: (id: string) => [...uploadKeys.all, "review", id] as const,
  anomalies: (orgId: string) =>
    [...uploadKeys.all, "anomalies", orgId] as const,
};

export function useUploadsList(filters: UploadFilters | null) {
  return useQuery({
    queryKey: filters ? uploadKeys.list(filters) : uploadKeys.all,
    queryFn: () => fetchUploads(filters!),
    enabled: Boolean(filters?.organizationId),
    staleTime: 10_000,
  });
}

export function useUploadStatus(uploadId: string | null, poll = false) {
  return useQuery({
    queryKey: uploadId ? uploadKeys.detail(uploadId) : uploadKeys.all,
    queryFn: () => fetchUploadStatus(uploadId!),
    enabled: Boolean(uploadId),
    refetchInterval: (query) => {
      if (!poll) return false;
      const status = query.state.data?.status;
      if (!status) return 2000;
      return isProcessingUploadStatus(status) ? 2000 : false;
    },
  });
}

export function useUploadReview(uploadId: string | null) {
  return useQuery({
    queryKey: uploadId ? uploadKeys.review(uploadId) : uploadKeys.all,
    queryFn: () => fetchUploadReview(uploadId!),
    enabled: Boolean(uploadId),
  });
}

export function useValidationAnomalies(orgId: string | null) {
  return useQuery({
    queryKey: orgId ? uploadKeys.anomalies(orgId) : uploadKeys.all,
    queryFn: () => fetchValidationAnomalies(orgId!),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });
}

export function useUploadFile(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<UploadFileInput, "organizationId">) =>
      uploadFile({ ...input, organizationId: orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useTriggerUploadProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uploadId: string) => triggerUploadProcess(uploadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.all });
    },
  });
}

export function useApproveUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uploadId,
      payload,
    }: {
      uploadId: string;
      payload?: ApproveUploadPayload;
    }) => approveUpload(uploadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uploadId,
      payload,
    }: {
      uploadId: string;
      payload: RejectUploadPayload;
    }) => rejectUpload(uploadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.all });
    },
  });
}

export function useResolveAnomaly(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      anomalyId,
      action,
      correctedValue,
    }: {
      anomalyId: string;
      action: "accepted" | "corrected" | "ignored";
      correctedValue?: string;
    }) => resolveValidationAnomaly(anomalyId, action, correctedValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadKeys.anomalies(orgId) });
      queryClient.invalidateQueries({ queryKey: uploadKeys.all });
    },
  });
}
