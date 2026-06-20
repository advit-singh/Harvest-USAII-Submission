import { NextResponse } from "next/server";
import { getUploadById, updateUploadStatus } from "@/services/upload/upload-service";

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
    stage: upload.processing_status === "rejected" ? "completed" : "validated",
    progress: 100,
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
  const reason = payload?.reason;

  if (!reason || typeof reason !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Rejection reason is required.",
        },
      },
      { status: 400 },
    );
  }

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

  await updateUploadStatus(params.id, "rejected", reason);
  const updatedUpload = await getUploadById(params.id);

  return NextResponse.json({
    success: true,
    data: updatedUpload ? mapUploadSummary(updatedUpload) : mapUploadSummary(upload),
  });
}
