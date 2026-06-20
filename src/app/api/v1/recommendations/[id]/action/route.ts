import { z } from "zod";
import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { submitRecommendationAction } from "@/services/recommendation/recommendation-service";
import { db } from "@/db/client";

const actionSchema = z.object({
  action: z.enum(["accepted", "rejected", "completed", "snoozed"]),
  notes: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid recommendation action.", 400);
    }

    const row = await db.query.recommendations.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, id),
    });

    if (!row) {
      return errorResponse("NOT_FOUND", "Recommendation not found.", 404);
    }

    await requireOrgMembership(row.organization_id, user.id);

    const updated = await submitRecommendationAction(
      id,
      row.organization_id,
      user.id,
      parsed.data.action,
      parsed.data.notes,
    );

    if (!updated) {
      return errorResponse("NOT_FOUND", "Recommendation not found.", 404);
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
