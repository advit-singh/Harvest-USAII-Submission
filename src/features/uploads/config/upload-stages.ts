import type { UploadStatus } from "@/types/upload";

export const UPLOAD_STAGES = [
  { id: "uploaded" as const, label: "Uploaded" },
  { id: "classified" as const, label: "Classified" },
  { id: "extracted" as const, label: "Extracted" },
  { id: "validated" as const, label: "Validated" },
  { id: "completed" as const, label: "Completed" },
] as const;

export const STATUS_LABELS: Record<UploadStatus, string> = {
  uploaded: "Uploaded",
  classifying: "Classifying",
  extracting: "Extracting",
  normalizing: "Normalizing",
  validating: "Validating",
  review_required: "Review required",
  completed: "Completed",
  failed: "Failed",
  rejected: "Rejected",
};

export const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".csv",
  ".xlsx",
  ".xls",
  ".docx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".zip",
].join(",");

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/heic",
  "application/zip",
];

export function getStageIndex(stage: string): number {
  return UPLOAD_STAGES.findIndex((s) => s.id === stage);
}
