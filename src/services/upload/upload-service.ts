import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { organization_sites, uploads, upload_jobs, extraction_results, validation_anomalies } from "@/db/schema";

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

export interface CreateUploadInput {
  organizationId: string;
  siteId: string;
  uploadedBy: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  checksum: string;
  description?: string;
}

export async function createUpload(input: CreateUploadInput) {
  const [upload] = await db
    .insert(uploads)
    .values({
      organization_id: input.organizationId,
      site_id: input.siteId,
      uploaded_by: input.uploadedBy,
      file_name: input.fileName,
      file_type: input.fileType,
      file_size: input.fileSize,
      storage_path: input.storagePath,
      checksum: input.checksum,
      description: input.description,
      processing_status: "uploaded",
    })
    .returning();

  await db.insert(upload_jobs).values({
    upload_id: upload.id,
    job_type: "classify",
    status: "pending",
  });

  return upload;
}

export async function getUploadById(uploadId: string) {
  return db.query.uploads.findFirst({
    where: eq(uploads.id, uploadId),
  });
}

export async function validateUploadTarget(organizationId: string, siteId: string) {
  const site = await db.query.organization_sites.findFirst({
    where: eq(organization_sites.id, siteId),
  });
  return Boolean(site && site.organization_id === organizationId);
}

export async function listUploads(
  organizationId: string,
  status?: string,
  siteId?: string,
  limit = 50,
) {
  const whereClause = status && status !== "all"
    ? siteId && siteId !== "all"
      ? and(
          eq(uploads.organization_id, organizationId),
          eq(uploads.processing_status, status),
          eq(uploads.site_id, siteId),
        )
      : and(eq(uploads.organization_id, organizationId), eq(uploads.processing_status, status))
    : siteId && siteId !== "all"
      ? and(eq(uploads.organization_id, organizationId), eq(uploads.site_id, siteId))
      : eq(uploads.organization_id, organizationId);

  return db
    .select()
    .from(uploads)
    .where(whereClause)
    .orderBy(desc(uploads.created_at))
    .limit(limit);
}

export async function updateUploadStatus(uploadId: string, status: UploadStatus, failureReason?: string) {
  return db
    .update(uploads)
    .set({ processing_status: status, failure_reason: failureReason })
    .where(eq(uploads.id, uploadId));
}

export async function createExtractionResult(uploadId: string, rawText: string, structuredJson: string, confidenceScore: number, modelVersion: string) {
  return db.insert(extraction_results).values({
    upload_id: uploadId,
    raw_text: rawText,
    structured_json: structuredJson,
    confidence_score: confidenceScore,
    model_version: modelVersion,
  });
}

export async function listUploadAnomalies(organizationId: string) {
  return db
    .select({
      id: validation_anomalies.id,
      upload_id: validation_anomalies.upload_id,
      type: validation_anomalies.type,
      severity: validation_anomalies.severity,
      reason: validation_anomalies.reason,
      confidence: validation_anomalies.confidence,
      suggested_fix: validation_anomalies.suggested_fix,
      status: validation_anomalies.status,
      created_at: validation_anomalies.created_at,
      updated_at: validation_anomalies.updated_at,
    })
    .from(validation_anomalies)
    .innerJoin(uploads, eq(validation_anomalies.upload_id, uploads.id))
    .where(eq(uploads.organization_id, organizationId))
    .orderBy(desc(validation_anomalies.created_at));
}

export async function getUploadReview(uploadId: string) {
  const upload = await getUploadById(uploadId);

  if (!upload) {
    return null;
  }

  const extractions = await db.query.extraction_results.findMany({
    where: eq(extraction_results.upload_id, uploadId),
  });

  const anomalies = await db.query.validation_anomalies.findMany({
    where: eq(validation_anomalies.upload_id, uploadId),
  });

  return {
    upload,
    extractions,
    anomalies,
  };
}
