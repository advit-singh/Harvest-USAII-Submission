import { classifyUpload } from "./classification-service";
import { extractUploadContent } from "./extraction-service";
import { normalizeUploadContent } from "./normalization-service";
import { validateUpload } from "./validation-service";
import {
  evaluateUploadAutoCommit,
  finalizeUpload,
  notifyReviewRequiredWarnings,
} from "./upload-orchestration-service";
import {
  createUploadJob,
  getUploadById,
  updateUploadJobStatus,
  updateUploadStatus,
  updateUploadClassification,
  createExtractionResult,
} from "./upload-service";

export async function runUploadPipeline(uploadId: string) {
  const upload = await getUploadById(uploadId);
  if (!upload) {
    throw new Error("Upload not found.");
  }

  const job = await createUploadJob(uploadId, "pipeline");
  await updateUploadJobStatus(job.id, "running");

  try {
    await updateUploadStatus(uploadId, "classifying");

    const previewExtraction = await extractUploadContent(upload.storage_path, "unknown");

    const classification = await classifyUpload({
      file_name: upload.file_name,
      file_type: upload.file_type,
      description: upload.description ?? undefined,
      contentPreview: previewExtraction.raw_text,
    });

    await updateUploadStatus(uploadId, "extracting");
    const extraction = await extractUploadContent(upload.storage_path, classification.classification);

    await updateUploadStatus(uploadId, "normalizing");
    const normalized = await normalizeUploadContent({
      classification: classification.classification,
      rawText: extraction.raw_text,
      structuredJson: extraction.structured_json,
      organizationId: upload.organization_id,
      entities: extraction.entities,
      contentType: extraction.content_type,
      overallConfidence: extraction.confidence_score / 100,
    });

    await updateUploadClassification(
      uploadId,
      normalized.classification,
      Math.round(
        (normalized.overallConfidence <= 1
          ? normalized.overallConfidence * 100
          : normalized.overallConfidence) || classification.confidence,
      ),
    );

    await createExtractionResult(
      uploadId,
      normalized.rawText,
      normalized.structuredJson,
      Math.round(normalized.overallConfidence * 100) || extraction.confidence_score,
      extraction.model_version,
    );

    await updateUploadStatus(uploadId, "validating");
    const issues = await validateUpload(
      uploadId,
      upload.organization_id,
      upload.checksum,
      normalized,
    );

    const validationIssues = issues.map((issue) => ({
      type: issue.type,
      severity: issue.severity,
      reason: issue.reason,
    }));

    const eligibility = await evaluateUploadAutoCommit({
      organizationId: upload.organization_id,
      normalized,
      validationIssues,
    });

    if (eligibility.eligible) {
      const finalized = await finalizeUpload(uploadId, {
        userId: upload.uploaded_by,
        triggerNotifications: true,
      });
      await updateUploadJobStatus(job.id, "completed");

      return {
        uploadId,
        status: "completed" as const,
        stage: "completed",
        progress: 100,
        classification: classification.classification,
        confidence: classification.confidence,
        committed: finalized.committed,
        intelligenceRefreshed: true,
      };
    }

    await updateUploadStatus(uploadId, "review_required");
    await updateUploadJobStatus(job.id, "completed");

    const hasReviewWarnings = validationIssues.some(
      (issue) => issue.severity === "warning" || issue.severity === "informational",
    );

    if (upload.uploaded_by && hasReviewWarnings) {
      void notifyReviewRequiredWarnings({
        organizationId: upload.organization_id,
        userId: upload.uploaded_by,
        uploadId,
        validationIssues,
      });
    }

    return {
      uploadId,
      status: "review_required" as const,
      stage: "validated",
      progress: 90,
      classification: classification.classification,
      confidence: classification.confidence,
      reviewReasons: eligibility.reasons,
    };
  } catch (error: unknown) {
    await updateUploadStatus(
      uploadId,
      "failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    await updateUploadJobStatus(
      job.id,
      "failed",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}
