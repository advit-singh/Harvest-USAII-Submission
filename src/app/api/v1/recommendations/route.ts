import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { listRecommendations } from "@/services/recommendation/recommendation-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const limitParam = Number(url.searchParams.get("limit") ?? "50");
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? limitParam : 50;

    const items = await listRecommendations({
      organizationId,
      status: url.searchParams.get("status") ?? undefined,
      priority: url.searchParams.get("priority") ?? undefined,
      siteId: url.searchParams.get("siteId") ?? undefined,
      limit,
    });

    return successResponse(items);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
