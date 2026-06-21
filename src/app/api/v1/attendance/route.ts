import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { listAttendanceRecords } from "@/services/operational/attendance-api-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const startDate = params.get("startDate");
    const endDate = params.get("endDate");

    const data = await listAttendanceRecords({
      organizationId,
      siteId: params.get("siteId") ?? undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
