import { getOrganizationSettings } from "@/services/organization/settings-service";
import {
  refreshSiteIntelligence,
  type IntelligenceRefreshResult,
} from "@/services/intelligence/intelligence-trigger";
import {
  notifyUploadCompleted,
  notifyValidationWarning,
} from "@/services/notification/notification-emitter";
import { commitUploadData, type CommitResult } from "./commit-service";
import { evaluateAutoCommitEligibility } from "./auto-commit-rules";
import type { NormalizedUploadPayload } from "./upload-types";
import { getUploadById, updateUploadStatus } from "./upload-service";

export interface FinalizeUploadResult {
  uploadId: string;
  status: "completed";
  committed: CommitResult;
  intelligenceRefresh: IntelligenceRefreshResult | null;
}

export interface AutoCommitEvaluationContext {
  organizationId: string;
  normalized: NormalizedUploadPayload;
  validationIssues: Array<{ type: string; severity: string }>;
}

export async function evaluateUploadAutoCommit(context: AutoCommitEvaluationContext) {
  const settings = await getOrganizationSettings(context.organizationId);

  return evaluateAutoCommitEligibility({
    classification: context.normalized.classification,
    overallConfidence: context.normalized.overallConfidence,
    entityCount: context.normalized.entities.length,
    validationIssues: context.validationIssues,
    aiSettings: settings.ai,
  });
}

export async function finalizeUpload(
  uploadId: string,
  options?: {
    entityEdits?: Array<{ id: string; value: string }>;
    userId?: string;
    triggerNotifications?: boolean;
    awaitIntelligenceRefresh?: boolean;
  },
): Promise<FinalizeUploadResult> {
  const upload = await getUploadById(uploadId);
  if (!upload) {
    throw new Error("Upload not found.");
  }

  const committed = await commitUploadData(uploadId, options?.entityEdits);
  await updateUploadStatus(uploadId, "completed");

  const notifyUserId = options?.userId ?? upload.uploaded_by;
  const shouldNotify = options?.triggerNotifications !== false;

  let intelligenceRefresh: IntelligenceRefreshResult | null = null;

  if (options?.awaitIntelligenceRefresh) {
    intelligenceRefresh = await refreshSiteIntelligence(
      upload.organization_id,
      upload.site_id,
      notifyUserId,
    );
  } else {
    void refreshSiteIntelligence(upload.organization_id, upload.site_id, notifyUserId);
  }

  if (shouldNotify && notifyUserId) {
    void notifyUploadCompleted({
      organizationId: upload.organization_id,
      userId: notifyUserId,
      uploadId,
      fileName: upload.file_name,
    });
  }

  return {
    uploadId,
    status: "completed",
    committed,
    intelligenceRefresh,
  };
}

export async function notifyReviewRequiredWarnings(params: {
  organizationId: string;
  userId: string;
  uploadId: string;
  validationIssues: Array<{ type: string; severity: string; reason?: string }>;
}) {
  const warningIssues = params.validationIssues.filter(
    (issue) => issue.severity === "warning" || issue.severity === "informational",
  );

  if (warningIssues.length === 0) {
    return;
  }

  const message =
    warningIssues.length === 1
      ? (warningIssues[0]?.reason ?? "Validation warnings require review.")
      : `${warningIssues.length} validation warnings require review.`;

  await notifyValidationWarning({
    organizationId: params.organizationId,
    userId: params.userId,
    uploadId: params.uploadId,
    message,
  });
}
