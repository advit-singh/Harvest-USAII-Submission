import { toApiConfidence } from "@/lib/api/confidence";

export function mapProcessingStatusToStage(status: string) {
  switch (status) {
    case "uploaded":
      return "uploaded";
    case "classifying":
      return "classified";
    case "extracting":
      return "extracted";
    case "normalizing":
    case "validating":
    case "review_required":
      return "validated";
    default:
      return "completed";
  }
}

export function mapProcessingStatusToProgress(status: string) {
  switch (status) {
    case "uploaded":
      return 0;
    case "classifying":
      return 20;
    case "extracting":
      return 40;
    case "normalizing":
      return 60;
    case "validating":
      return 80;
    case "review_required":
      return 90;
    default:
      return 100;
  }
}

export function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapUploadSummary(upload: {
  id: string;
  organization_id: string;
  site_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  processing_status: string;
  classification: string;
  confidence_score: number;
  description?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  failure_reason?: string | null;
}) {
  return {
    id: upload.id,
    organizationId: upload.organization_id,
    siteId: upload.site_id,
    fileName: upload.file_name,
    fileType: upload.file_type,
    fileSize: upload.file_size,
    status: upload.processing_status,
    stage: mapProcessingStatusToStage(upload.processing_status),
    progress: mapProcessingStatusToProgress(upload.processing_status),
    classification: upload.classification,
    confidence: toApiConfidence(upload.confidence_score),
    description: upload.description ?? undefined,
    createdAt: toIsoString(upload.created_at),
    updatedAt: toIsoString(upload.updated_at),
    failureReason: upload.failure_reason ?? undefined,
  };
}
