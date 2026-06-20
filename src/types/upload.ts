/** Upload workspace types — aligned with API_SPEC §14–19 */

export type UploadTabId = "upload" | "queue" | "history" | "validation";

export type UploadStatus =
  | "uploaded"
  | "classifying"
  | "extracting"
  | "normalizing"
  | "validating"
  | "review_required"
  | "completed"
  | "failed"
  | "rejected";

export type UploadStage =
  | "uploaded"
  | "classified"
  | "extracted"
  | "validated"
  | "completed";

export type UploadClassification =
  | "receipt"
  | "inventory_sheet"
  | "attendance_report"
  | "donation_log"
  | "waste_report"
  | "invoice"
  | "mixed"
  | "unknown";

export interface UploadSummary {
  id: string;
  organizationId: string;
  siteId: string;
  siteName?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: UploadStatus;
  stage: UploadStage;
  progress: number;
  classification: UploadClassification;
  confidence: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

export interface UploadStatusDetail {
  id: string;
  status: UploadStatus;
  stage: UploadStage;
  progress: number;
  classification?: UploadClassification;
  confidence?: number;
  estimatedCompletionAt?: string;
}

export interface UploadFileResponse {
  uploadId: string;
  status: UploadStatus;
}

export interface ExtractedEntity {
  id: string;
  field: string;
  value: string;
  confidence: number;
  editable: boolean;
}

export interface ValidationAnomaly {
  id: string;
  uploadId: string;
  type:
    | "duplicate_upload"
    | "attendance_spike"
    | "inventory_conflict"
    | "cost_outlier"
    | "missing_field";
  severity: "critical" | "warning" | "informational";
  reason: string;
  confidence: number;
  suggestedFix: string;
  status: "open" | "accepted" | "corrected" | "ignored";
}

export interface UploadReview {
  uploadId: string;
  fileName: string;
  originalContent: string;
  originalContentType: "text" | "image" | "table";
  extractedEntities: ExtractedEntity[];
  validationIssues: ValidationAnomaly[];
  overallConfidence: number;
  classification: UploadClassification;
}

export interface UploadFilters {
  organizationId: string;
  status?: UploadStatus | "all";
  siteId?: string;
  search?: string;
  limit?: number;
}

export interface ApproveUploadPayload {
  entities?: Array<{ id: string; value: string }>;
}

export interface RejectUploadPayload {
  reason: string;
}

export type TerminalUploadStatus = Extract<
  UploadStatus,
  "completed" | "failed" | "rejected"
>;

export function isTerminalUploadStatus(status: UploadStatus): boolean {
  return status === "completed" || status === "failed" || status === "rejected";
}

export function isProcessingUploadStatus(status: UploadStatus): boolean {
  return (
    status === "uploaded" ||
    status === "classifying" ||
    status === "extracting" ||
    status === "normalizing" ||
    status === "validating"
  );
}
