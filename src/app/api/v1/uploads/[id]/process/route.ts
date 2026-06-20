import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { toApiConfidence } from "@/lib/api/confidence";
import { getUploadById } from "@/services/upload/upload-service";
import { runUploadPipeline } from "@/services/upload/pipeline-service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const upload = await getUploadById(id);

    if (!upload) {
      return errorResponse("NOT_FOUND", "Upload not found.", 404);
    }

    await requireOrgMembership(upload.organization_id, user.id);

    const result = await runUploadPipeline(id);
    return successResponse({
      ...result,
      confidence: toApiConfidence(result.confidence),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    return errorResponse(
      "PROCESSING_FAILED",
      error instanceof Error ? error.message : "Upload processing failed.",
      500,
    );
  }
}
