import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import { deleteSchedule, updateSchedule } from "@/services/report/schedule-service";
import type { UpdateReportSchedulePayload } from "@/types/report";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as UpdateReportSchedulePayload & {
      organizationId?: string;
    };
    const organizationId = body.organizationId;
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);
    await requirePermission(organizationId, user.id, "reports.generate");

    const data = await updateSchedule(id, organizationId, body);
    if (!data) {
      return errorResponse("NOT_FOUND", "Schedule not found.", 404);
    }
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const paramsUrl = new URL(request.url).searchParams;
    const organizationId = paramsUrl.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);
    await requirePermission(organizationId, user.id, "reports.generate");

    const deleted = await deleteSchedule(id, organizationId);
    if (!deleted) {
      return errorResponse("NOT_FOUND", "Schedule not found.", 404);
    }
    return successResponse({ id });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
