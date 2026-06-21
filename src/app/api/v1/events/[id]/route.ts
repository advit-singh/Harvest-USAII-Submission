import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import { updateEvent } from "@/services/operational/events-api-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as {
      organizationId?: string;
      name?: string;
      eventType?: string;
      startDate?: string;
      endDate?: string | null;
      expectedAttendance?: number | null;
    };

    if (!body.organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(body.organizationId, user.id);
    await requirePermission(body.organizationId, user.id, "uploads.manage");

    const data = await updateEvent(id, body.organizationId, {
      name: body.name,
      eventType: body.eventType,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate === undefined ? undefined : body.endDate ? new Date(body.endDate) : null,
      expectedAttendance: body.expectedAttendance,
    });

    if (!data) {
      return errorResponse("NOT_FOUND", "Event not found.", 404);
    }
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
