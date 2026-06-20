import { createValidationAnomaly } from "./upload-service";

export interface ValidationIssue {
  type: "duplicate_upload" | "attendance_spike" | "inventory_conflict" | "cost_outlier" | "missing_field";
  severity: "critical" | "warning" | "informational";
  reason: string;
  confidence: number;
  suggested_fix?: string;
}

export async function validateUpload(
  uploadId: string,
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

  if (input.rawText.length < 10) {
    issues.push({
      type: "missing_field",
      severity: "informational",
      reason: "Extracted file content is very short.",
      confidence: 40,
      suggested_fix: "Confirm the upload contains readable content.",
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
