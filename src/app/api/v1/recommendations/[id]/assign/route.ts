import { z } from "zod";
import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { assignRecommendation } from "@/services/recommendation/recommendation-service";
import { db } from "@/db/client";

const assignSchema = z.object({
  assigneeId: z.string().uuid(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = assignSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid assignment payload.", 400);
    }

    const row = await db.query.recommendations.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, id),
    });

    if (!row) {
      return errorResponse("NOT_FOUND", "Recommendation not found.", 404);
    }

    await requireOrgMembership(row.organization_id, user.id);

    const updated = await assignRecommendation(
      id,
      row.organization_id,
      parsed.data.assigneeId,
      parsed.data.dueDate,
    );

    if (!updated) {
      return errorResponse("NOT_FOUND", "Recommendation not found.", 404);
    }

    return successResponse(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    return errorResponse(
      "ASSIGNMENT_FAILED",
      error instanceof Error ? error.message : "Failed to assign recommendation.",
      500,
    );
  }
}
