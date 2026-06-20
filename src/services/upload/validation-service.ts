import { createValidationAnomaly, findUploadByChecksum } from "./upload-service";

export interface ValidationIssue {
  type: "duplicate_upload" | "attendance_spike" | "inventory_conflict" | "cost_outlier" | "missing_field";
  severity: "critical" | "warning" | "informational";
  reason: string;
  confidence: number;
  suggested_fix?: string;
}

export async function validateUpload(
  uploadId: string,
  organizationId: string,
  checksum: string,
  input: { classification: string; rawText: string },
) {
  const issues: ValidationIssue[] = [];

  if (input.classification === "unknown") {
    issues.push({
      type: "missing_field",
      severity: "warning",
      reason: "The system could not classify this upload type.",
      confidence: 50,
      suggested_fix: "Please verify the file type or provide additional context.",
    });
  }

  if (input.rawText.trim().length < 20) {
    issues.push({
      type: "missing_field",
      severity: "informational",
      reason: "Extracted file content is very short.",
      confidence: 40,
      suggested_fix: "Confirm the upload contains readable content.",
    });
  }

  const duplicate = await findUploadByChecksum(checksum, organizationId);
  if (duplicate && duplicate.id !== uploadId) {
    issues.push({
      type: "duplicate_upload",
      severity: "warning",
      reason: "An upload with the same content already exists for this organization.",
      confidence: 85,
      suggested_fix: "Review the duplicate upload and remove or reconcile it if necessary.",
    });
  }

  const persistedIssues = [];
  for (const issue of issues) {
    const anomaly = await createValidationAnomaly(
      uploadId,
      issue.type,
      issue.severity,
      issue.reason,
      issue.confidence,
      issue.suggested_fix,
    );
    persistedIssues.push(anomaly);
  }

  return persistedIssues;
}
