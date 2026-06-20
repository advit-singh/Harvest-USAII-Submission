import { classifyUpload } from "./classification-service";
import { extractUploadContent } from "./extraction-service";
import { normalizeUploadContent } from "./normalization-service";
import { validateUpload } from "./validation-service";
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
    const classification = await classifyUpload({
      file_name: upload.file_name,
      file_type: upload.file_type,
      description: upload.description ?? undefined,
    });

    await updateUploadStatus(uploadId, "extracting");
    const extraction = await extractUploadContent(upload.storage_path);

    await updateUploadStatus(uploadId, "normalizing");
    const normalized = await normalizeUploadContent({
      classification: classification.classification,
      rawText: extraction.raw_text,
      structuredJson: extraction.structured_json,
    });

    await updateUploadClassification(
      uploadId,
      normalized.classification,
      classification.confidence,
    );

    await createExtractionResult(
      uploadId,
      normalized.rawText,
      normalized.structuredJson,
      extraction.confidence_score,
      extraction.model_version,
    );

    await updateUploadStatus(uploadId, "validating");
    const issues = await validateUpload(
      uploadId,
      upload.organization_id,
      upload.checksum,
      normalized,
    );

    if (issues.length > 0) {
      await updateUploadStatus(uploadId, "review_required");
      await updateUploadJobStatus(job.id, "completed");
      return {
        uploadId,
        status: "review_required",
        stage: "validated",
        progress: 90,
        classification: classification.classification,
        confidence: classification.confidence,
      };
    }

    await updateUploadStatus(uploadId, "completed");
    await updateUploadJobStatus(job.id, "completed");

    return {
      uploadId,
      status: "completed",
      stage: "completed",
      progress: 100,
      classification: classification.classification,
      confidence: classification.confidence,
    };
  } catch (error: unknown) {
    await updateUploadStatus(uploadId, "failed", error instanceof Error ? error.message : "Unknown error");
    await updateUploadJobStatus(job.id, "failed", error instanceof Error ? error.message : String(error));
    throw error;
  }
}
