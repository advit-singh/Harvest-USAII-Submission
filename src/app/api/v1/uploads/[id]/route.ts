import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { toApiConfidence } from "@/lib/api/confidence";
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  mapProcessingStatusToProgress,
  mapProcessingStatusToStage,
} from "@/lib/api/upload-mappers";
import { getUploadById } from "@/services/upload/upload-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const upload = await getUploadById(id);

    if (!upload) {
      return errorResponse("NOT_FOUND", "Upload not found.", 404);
    }

    await requireOrgMembership(upload.organization_id, user.id);

    return successResponse({
      id: upload.id,
      status: upload.processing_status,
      stage: mapProcessingStatusToStage(upload.processing_status),
      progress: mapProcessingStatusToProgress(upload.processing_status),
      classification: upload.classification,
      confidence: toApiConfidence(upload.confidence_score),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
