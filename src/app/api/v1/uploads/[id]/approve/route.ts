import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { mapUploadSummary } from "@/lib/api/upload-mappers";
import { finalizeUpload } from "@/services/upload/upload-orchestration-service";
import { getUploadById } from "@/services/upload/upload-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const upload = await getUploadById(id);

    if (!upload) {
      return errorResponse("NOT_FOUND", "Upload not found.", 404);
    }

    await requireOrgMembership(upload.organization_id, user.id);

    const payload = await request.json().catch(() => ({}));
    const entityEdits = payload?.entities as Array<{ id: string; value: string }> | undefined;

    const finalized = await finalizeUpload(id, {
      entityEdits,
      userId: user.id,
      triggerNotifications: true,
    });

    const updatedUpload = await getUploadById(id);

    return successResponse({
      ...(updatedUpload ? mapUploadSummary(updatedUpload) : mapUploadSummary(upload)),
      committed: finalized.committed,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    return errorResponse(
      "PROCESSING_FAILED",
      error instanceof Error ? error.message : "Failed to commit upload data.",
      500,
    );
  }
}
