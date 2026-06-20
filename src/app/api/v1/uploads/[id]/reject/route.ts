import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { mapUploadSummary } from "@/lib/api/upload-mappers";
import { getUploadById, updateUploadStatus } from "@/services/upload/upload-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const payload = await request.json().catch(() => ({}));
    const reason = payload?.reason;

    if (!reason || typeof reason !== "string") {
      return errorResponse("VALIDATION_ERROR", "Rejection reason is required.", 400);
    }

    const upload = await getUploadById(id);
    if (!upload) {
      return errorResponse("NOT_FOUND", "Upload not found.", 404);
    }

    await requireOrgMembership(upload.organization_id, user.id);

    await updateUploadStatus(id, "rejected", reason);
    const updatedUpload = await getUploadById(id);

    return successResponse(
      updatedUpload ? mapUploadSummary(updatedUpload) : mapUploadSummary(upload),
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
