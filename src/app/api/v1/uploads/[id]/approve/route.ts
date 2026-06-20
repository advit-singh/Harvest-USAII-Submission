import { NextResponse } from "next/server";
import { getUploadById, approveUpload } from "@/services/upload/upload-service";

function toIsoString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

function mapUploadSummary(upload: any) {
  return {
    id: upload.id,
    organizationId: upload.organization_id,
    siteId: upload.site_id,
    fileName: upload.file_name,
    fileType: upload.file_type,
    fileSize: upload.file_size,
    status: upload.processing_status,
    stage: upload.processing_status === "completed" ? "completed" : "validated",
    progress: upload.processing_status === "completed" ? 100 : 90,
    classification: upload.classification,
    confidence: upload.confidence_score,
    description: upload.description ?? undefined,
    createdAt: toIsoString(upload.created_at),
    updatedAt: toIsoString(upload.updated_at),
    failureReason: upload.failure_reason ?? undefined,
  };
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json();
  const entities = Array.isArray(payload?.entities) ? payload.entities : [];

  const upload = await getUploadById(params.id);

  if (!upload) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Upload not found.",
        },
      },
      { status: 404 },
    );
  }

  await approveUpload(params.id, entities);
  const updatedUpload = await getUploadById(params.id);

  return NextResponse.json({
    success: true,
    data: updatedUpload ? mapUploadSummary(updatedUpload) : mapUploadSummary(upload),
  });
}
