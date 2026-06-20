import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createUpload, listUploads, validateUploadTarget } from "@/services/upload/upload-service";

function mapProcessingStatusToStage(status: string) {
  switch (status) {
    case "uploaded":
      return "uploaded";
    case "classifying":
      return "classified";
    case "extracting":
      return "extracted";
    case "normalizing":
    case "validating":
    case "review_required":
      return "validated";
    default:
      return "completed";
  }
}

function mapProcessingStatusToProgress(status: string) {
  switch (status) {
    case "uploaded":
      return 0;
    case "classifying":
      return 20;
    case "extracting":
      return 40;
    case "normalizing":
      return 60;
    case "validating":
      return 80;
    case "review_required":
      return 90;
    default:
      return 100;
  }
}

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
    stage: mapProcessingStatusToStage(upload.processing_status),
    progress: mapProcessingStatusToProgress(upload.processing_status),
    classification: upload.classification,
    confidence: upload.confidence_score,
    description: upload.description ?? undefined,
    createdAt: toIsoString(upload.created_at),
    updatedAt: toIsoString(upload.updated_at),
    failureReason: upload.failure_reason ?? undefined,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "organizationId is required.",
        },
      },
      { status: 400 },
    );
  }

  const status = url.searchParams.get("status") ?? undefined;
  const siteId = url.searchParams.get("siteId") ?? undefined;
  const limitParam = Number(url.searchParams.get("limit") ?? "50");
  const limit = Number.isInteger(limitParam) && limitParam > 0 ? limitParam : 50;

  const uploads = await listUploads(organizationId, status, siteId, limit);
  return NextResponse.json({ success: true, data: uploads.map(mapUploadSummary) });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const siteId = formData.get("siteId");
  const organizationId = formData.get("organizationId");
  const description = formData.get("description");

  if (!(file instanceof File) || typeof siteId !== "string" || typeof organizationId !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid upload payload.",
        },
      },
      { status: 400 },
    );
  }

  if (!(await validateUploadTarget(organizationId, siteId))) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_TARGET",
          message: "Site does not belong to the specified organization.",
        },
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required.",
        },
      },
      { status: 401 },
    );
  }

  const storagePath = `uploads/${user.id}/${file.name}`;
  const uploadResponse = await supabase.storage
    .from("uploads")
    .upload(storagePath, file, { cacheControl: "3600", upsert: true });

  if (uploadResponse.error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: uploadResponse.error.message,
        },
      },
      { status: 500 },
    );
  }

  const data = await file.arrayBuffer();
  const checksum = crypto.createHash("sha256").update(Buffer.from(data)).digest("hex");

  const upload = await createUpload({
    organizationId,
    siteId,
    uploadedBy: user.id,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    storagePath,
    checksum,
    description: typeof description === "string" ? description : undefined,
  });

  return NextResponse.json({
    success: true,
    data: { uploadId: upload.id, status: upload.processing_status },
  });
}
