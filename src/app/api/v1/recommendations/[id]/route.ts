import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { getRecommendationById } from "@/services/recommendation/recommendation-service";
import { db } from "@/db/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;

    const row = await db.query.recommendations.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, id),
    });

    if (!row) {
      return errorResponse("NOT_FOUND", "Recommendation not found.", 404);
    }

    await requireOrgMembership(row.organization_id, user.id);

    const recommendation = await getRecommendationById(id, row.organization_id);
    if (!recommendation) {
      return errorResponse("NOT_FOUND", "Recommendation not found.", 404);
    }

    return successResponse(recommendation);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
