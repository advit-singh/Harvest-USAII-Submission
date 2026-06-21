import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { getImpactMetrics } from "@/services/impact/impact-service";
import type { ImpactTimeRange } from "@/types/impact";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }
    await requireOrgMembership(organizationId, user.id);

    const timeRange = (params.get("timeRange") ?? "month") as ImpactTimeRange;
    const siteId = params.get("siteId") ?? undefined;

    const data = await getImpactMetrics({ organizationId, timeRange, siteId });
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
