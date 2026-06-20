import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { toApiConfidence } from "@/lib/api/confidence";
import { errorResponse, successResponse } from "@/lib/api/response";
import { resolveValidationAnomaly } from "@/services/upload/anomaly-service";
import { getUploadById } from "@/services/upload/upload-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const payload = await request.json();
    const action = payload?.action;

    if (!action || !["accepted", "corrected", "ignored"].includes(action)) {
      return errorResponse("VALIDATION_ERROR", "Invalid anomaly action.", 400);
    }

    const resolved = await resolveValidationAnomaly(id, action);
    if (!resolved) {
      return errorResponse("NOT_FOUND", "Validation anomaly not found.", 404);
    }

    const upload = await getUploadById(resolved.upload_id);
    if (upload) {
      await requireOrgMembership(upload.organization_id, user.id);
    }

    return successResponse({
      id: resolved.id,
      uploadId: resolved.upload_id,
      type: resolved.type,
      severity: resolved.severity,
      reason: resolved.reason,
      confidence: toApiConfidence(resolved.confidence),
      suggestedFix: resolved.suggested_fix,
      status: resolved.status,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
