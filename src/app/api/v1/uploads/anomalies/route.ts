import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { toApiConfidence } from "@/lib/api/confidence";
import { errorResponse, successResponse } from "@/lib/api/response";
import { listUploadAnomalies } from "@/services/upload/upload-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const anomalies = await listUploadAnomalies(organizationId);
    return successResponse(
      anomalies.map((anomaly) => ({
        id: anomaly.id,
        uploadId: anomaly.upload_id,
        type: anomaly.type,
        severity: anomaly.severity,
        reason: anomaly.reason,
        confidence: toApiConfidence(anomaly.confidence),
        suggestedFix: anomaly.suggested_fix,
        status: anomaly.status,
      })),
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
