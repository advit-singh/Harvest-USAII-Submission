import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { uploads } from "@/db/schema";
import { createValidationAnomaly } from "./upload-service";
import type { NormalizedUploadPayload } from "./upload-types";

export interface ValidationIssue {
  type:
    | "duplicate_upload"
    | "attendance_spike"
    | "inventory_conflict"
    | "cost_outlier"
    | "missing_field";
  severity: "critical" | "warning" | "informational";
  reason: string;
  confidence: number;
  suggested_fix?: string;
}

export async function validateUpload(
  uploadId: string,
  organizationId: string,
  checksum: string,
  input: NormalizedUploadPayload,
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

  if (input.entities.length === 0) {
    issues.push({
      type: "missing_field",
      severity: "warning",
      reason: "No structured entities were extracted from this upload.",
      confidence: 60,
      suggested_fix: "Review the file and edit extracted fields before approving.",
    });
  }

  const duplicate = await db.query.uploads.findFirst({
    where: and(
      eq(uploads.organization_id, organizationId),
      eq(uploads.checksum, checksum),
      ne(uploads.id, uploadId),
      ne(uploads.processing_status, "rejected"),
    ),
  });

  if (duplicate) {
    issues.push({
      type: "duplicate_upload",
      severity: "warning",
      reason: "A file with the same checksum was previously uploaded.",
      confidence: 95,
      suggested_fix: "Verify this is not a duplicate upload.",
    });
  }

  const attendanceEntities = input.entities.filter((e) => e.entity_type === "attendance_record");
  for (const entity of attendanceEntities) {
    const count = Number(entity.value ?? entity.quantity ?? 0);
    if (count > 5000) {
      issues.push({
        type: "attendance_spike",
        severity: "warning",
        reason: `Attendance count ${count} is unusually high.`,
        confidence: 75,
        suggested_fix: "Verify attendance numbers before approving.",
      });
    }
    if (count < 0) {
      issues.push({
        type: "missing_field",
        severity: "critical",
        reason: "Negative attendance value detected.",
        confidence: 90,
        suggested_fix: "Correct the attendance count.",
      });
    }
  }

  for (const entity of input.entities) {
    const cost = entity.cost ?? (typeof entity.value === "number" ? entity.value : undefined);
    if (entity.entity_type === "cost" && typeof cost === "number" && cost > 100000) {
      issues.push({
        type: "cost_outlier",
        severity: "warning",
        reason: `Cost value $${cost} appears unusually high.`,
        confidence: 70,
        suggested_fix: "Verify cost amounts.",
      });
    }

    if (
      (entity.quantity !== undefined && entity.quantity < 0) ||
      (typeof entity.value === "number" && entity.value < 0)
    ) {
      issues.push({
        type: "inventory_conflict",
        severity: "critical",
        reason: `Negative quantity detected for ${entity.name ?? entity.field ?? "item"}.`,
        confidence: 85,
        suggested_fix: "Correct quantity values before approving.",
      });
    }
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
