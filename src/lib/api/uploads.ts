import { apiClient } from "@/lib/api/client";
import { isLiveIntelligenceApiEnabled } from "@/lib/api/api-mode";
import { resolveIntelligenceOrgId, resolveIntelligenceSiteId } from "@/lib/api/intelligence-org-bridge";
import {
  approveMockUpload,
  createMockUpload,
  getMockAnomalies,
  getMockUploadById,
  getMockUploadReview,
  getMockUploads,
  rejectMockUpload,
  resolveMockAnomaly,
  triggerMockProcessing,
} from "@/lib/mocks/uploads-fixtures";
import type {
  ApproveUploadPayload,
  RejectUploadPayload,
  UploadFileResponse,
  UploadFilters,
  UploadReview,
  UploadStatusDetail,
  UploadSummary,
  ValidationAnomaly,
} from "@/types/upload";

const MOCK_DELAY_MS = 150;

async function mockDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
}

export interface UploadFileInput {
  file: File;
  organizationId: string;
  siteId: string;
  description?: string;
}

async function uploadFileMultipart(
  input: UploadFileInput,
): Promise<UploadFileResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("siteId", input.siteId);
  if (input.description) {
    formData.append("description", input.description);
  }
  formData.append("organizationId", input.organizationId);

  const response = await fetch(`${baseUrl}/api/v1/uploads`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const json = (await response.json()) as {
    success: boolean;
    data?: UploadFileResponse;
    error?: { code: string; message: string };
  };

  if (!json.success || !json.data) {
    throw new Error(json.error?.message ?? "Upload failed");
  }

  return json.data;
}

export async function fetchUploads(
  filters: UploadFilters,
): Promise<UploadSummary[]> {
  if (!isLiveIntelligenceApiEnabled()) {
    await mockDelay();
    let items = getMockUploads(filters.organizationId);

    if (filters.status && filters.status !== "all") {
      items = items.filter((u) => u.status === filters.status);
    }
    if (filters.siteId && filters.siteId !== "all") {
      items = items.filter((u) => u.siteId === filters.siteId);
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (u) =>
          u.fileName.toLowerCase().includes(q) ||
          u.classification.toLowerCase().includes(q),
      );
    }
    if (filters.limit) {
      items = items.slice(0, filters.limit);
    }
    return items;
  }

  const params = new URLSearchParams({
    organizationId: resolveIntelligenceOrgId(filters.organizationId),
  });
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.siteId) {
    params.set("siteId", resolveIntelligenceSiteId(filters.siteId));
  }
  if (filters.limit) params.set("limit", String(filters.limit));

  return apiClient<UploadSummary[]>(`/uploads?${params.toString()}`);
}

export async function uploadFile(
  input: UploadFileInput,
): Promise<UploadFileResponse> {
  if (!isLiveIntelligenceApiEnabled()) {
    await mockDelay();
    const upload = createMockUpload({
      organizationId: input.organizationId,
      siteId: input.siteId,
      fileName: input.file.name,
      fileType: input.file.type || "application/octet-stream",
      fileSize: input.file.size,
      description: input.description,
    });
    triggerMockProcessing(upload.id);
    return { uploadId: upload.id, status: upload.status };
  }

  return uploadFileMultipart({
    ...input,
    organizationId: resolveIntelligenceOrgId(input.organizationId),
    siteId: resolveIntelligenceSiteId(input.siteId),
  });
}

export async function fetchUploadStatus(
  uploadId: string,
): Promise<UploadStatusDetail> {
  if (!isLiveIntelligenceApiEnabled()) {
    await mockDelay();
    const upload = getMockUploadById(uploadId);
    if (!upload) throw new Error(`Upload not found: ${uploadId}`);
    return {
      id: upload.id,
      status: upload.status,
      stage: upload.stage,
      progress: upload.progress,
      classification: upload.classification,
      confidence: upload.confidence,
    };
  }

  return apiClient<UploadStatusDetail>(`/uploads/${uploadId}`);
}

export async function triggerUploadProcess(
  uploadId: string,
): Promise<UploadStatusDetail> {
  if (!isLiveIntelligenceApiEnabled()) {
    await mockDelay();
    const upload = triggerMockProcessing(uploadId);
    if (!upload) throw new Error(`Upload not found: ${uploadId}`);
    return {
      id: upload.id,
      status: upload.status,
      stage: upload.stage,
      progress: upload.progress,
      classification: upload.classification,
      confidence: upload.confidence,
    };
  }

  return apiClient<UploadStatusDetail>(`/uploads/${uploadId}/process`, {
    method: "POST",
  });
}

export async function fetchUploadReview(
  uploadId: string,
): Promise<UploadReview> {
  if (!isLiveIntelligenceApiEnabled()) {
    await mockDelay();
    const review = getMockUploadReview(uploadId);
    if (!review) throw new Error(`Review not found: ${uploadId}`);
    return review;
  }

  return apiClient<UploadReview>(`/uploads/${uploadId}/review`);
}

export async function approveUpload(
  uploadId: string,
  payload?: ApproveUploadPayload,
): Promise<UploadSummary> {
  if (!isLiveIntelligenceApiEnabled()) {
    await mockDelay();
    const upload = approveMockUpload(uploadId, payload);
    if (!upload) throw new Error(`Upload not found: ${uploadId}`);
    return upload;
  }

  return apiClient<UploadSummary>(`/uploads/${uploadId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function rejectUpload(
  uploadId: string,
  payload: RejectUploadPayload,
): Promise<UploadSummary> {
  if (!isLiveIntelligenceApiEnabled()) {
    await mockDelay();
    const upload = rejectMockUpload(uploadId, payload.reason);
    if (!upload) throw new Error(`Upload not found: ${uploadId}`);
    return upload;
  }

  return apiClient<UploadSummary>(`/uploads/${uploadId}/reject`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchValidationAnomalies(
  orgId: string,
): Promise<ValidationAnomaly[]> {
  if (!isLiveIntelligenceApiEnabled()) {
    await mockDelay();
    const uploadIds = new Set(
      getMockUploads(orgId).map((u) => u.id),
    );
    return getMockAnomalies().filter(
      (a) => uploadIds.has(a.uploadId) && a.status === "open",
    );
  }

  return apiClient<ValidationAnomaly[]>(
    `/uploads/anomalies?organizationId=${resolveIntelligenceOrgId(orgId)}`,
  );
}

export async function resolveValidationAnomaly(
  anomalyId: string,
  action: "accepted" | "corrected" | "ignored",
): Promise<ValidationAnomaly> {
  if (!isLiveIntelligenceApiEnabled()) {
    await mockDelay();
    const anomaly = resolveMockAnomaly(anomalyId, action);
    if (!anomaly) throw new Error(`Anomaly not found: ${anomalyId}`);
    return anomaly;
  }

  return apiClient<ValidationAnomaly>(`/uploads/anomalies/${anomalyId}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}
