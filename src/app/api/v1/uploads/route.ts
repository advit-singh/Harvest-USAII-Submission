import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { mapUploadSummary } from "@/lib/api/upload-mappers";
import { createUpload, listUploads, validateUploadTarget } from "@/services/upload/upload-service";
import { runUploadPipeline } from "@/services/upload/pipeline-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const status = url.searchParams.get("status") ?? undefined;
    const siteId = url.searchParams.get("siteId") ?? undefined;
    const limitParam = Number(url.searchParams.get("limit") ?? "50");
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? limitParam : 50;

    const uploads = await listUploads(organizationId, status, siteId, limit);
    return successResponse(uploads.map(mapUploadSummary));
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const siteId = formData.get("siteId");
    const organizationId = formData.get("organizationId");
    const description = formData.get("description");

    if (!(file instanceof File) || typeof siteId !== "string" || typeof organizationId !== "string") {
      return errorResponse("VALIDATION_ERROR", "Invalid upload payload.", 400);
    }

    const user = await requireAuthenticatedUser();
    await requireOrgMembership(organizationId, user.id);

    if (!(await validateUploadTarget(organizationId, siteId))) {
      return errorResponse("INVALID_TARGET", "Site does not belong to the specified organization.", 400);
    }

    const supabase = await createClient();
    const storagePath = `uploads/${user.id}/${Date.now()}-${file.name}`;
    const uploadResponse = await supabase.storage
      .from("uploads")
      .upload(storagePath, file, { cacheControl: "3600", upsert: true });

    if (uploadResponse.error) {
      return errorResponse("UPLOAD_FAILED", uploadResponse.error.message, 500);
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

    runUploadPipeline(upload.id).catch((error) => {
      console.error("Auto pipeline failed:", error);
    });

    return successResponse({ uploadId: upload.id, status: upload.processing_status });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
