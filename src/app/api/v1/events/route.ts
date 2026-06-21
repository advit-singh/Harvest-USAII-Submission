import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import { createEvent, listEvents } from "@/services/operational/events-api-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);
    const data = await listEvents(organizationId, params.get("siteId") ?? undefined);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as {
      organizationId?: string;
      siteId?: string;
      name?: string;
      eventType?: string;
      startDate?: string;
      endDate?: string;
      expectedAttendance?: number;
    };

    if (!body.organizationId || !body.siteId || !body.name || !body.eventType || !body.startDate) {
      return errorResponse(
        "VALIDATION_ERROR",
        "organizationId, siteId, name, eventType, and startDate are required.",
        400,
      );
    }

    await requireOrgMembership(body.organizationId, user.id);
    await requirePermission(body.organizationId, user.id, "uploads.manage");

    const data = await createEvent({
      organizationId: body.organizationId,
      siteId: body.siteId,
      name: body.name,
      eventType: body.eventType,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      expectedAttendance: body.expectedAttendance,
      createdBy: user.id,
    });
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
