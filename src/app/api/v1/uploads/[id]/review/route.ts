import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { toApiConfidence } from "@/lib/api/confidence";
import { errorResponse, successResponse } from "@/lib/api/response";
import { getUploadReview } from "@/services/upload/upload-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const review = await getUploadReview(id);

    if (!review) {
      return errorResponse("NOT_FOUND", "Upload review not found.", 404);
    }

    await requireOrgMembership(review.upload.organization_id, user.id);

    const extraction = review.extractions?.[0];

    return successResponse({
      uploadId: review.upload.id,
      fileName: review.upload.file_name,
      originalContent: extraction?.raw_text ?? extraction?.structured_json ?? "",
      originalContentType: review.contentType,
      extractedEntities: review.extractedEntities.map((entity) => ({
        ...entity,
        confidence: toApiConfidence(
          entity.confidence <= 1 ? entity.confidence * 100 : entity.confidence,
        ),
      })),
      validationIssues: review.anomalies.map((anomaly) => ({
        id: anomaly.id,
        uploadId: anomaly.upload_id,
        type: anomaly.type,
        severity: anomaly.severity,
        reason: anomaly.reason,
        confidence: toApiConfidence(anomaly.confidence),
        suggestedFix: anomaly.suggested_fix,
        status: anomaly.status,
      })),
      overallConfidence: toApiConfidence(review.upload.confidence_score),
      classification: review.upload.classification,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
