import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import { listAuditLogs } from "@/services/platform/audit-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);
    await requirePermission(organizationId, user.id, "org.manage");

    const startDate = params.get("startDate");
    const endDate = params.get("endDate");

    const data = await listAuditLogs({
      organizationId,
      userId: params.get("userId") ?? undefined,
      entityType: params.get("entityType") ?? undefined,
      action: params.get("action") ?? undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: params.get("limit") ? Number(params.get("limit")) : undefined,
    });
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
