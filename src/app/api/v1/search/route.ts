import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { searchOrganization } from "@/services/search/search-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    const query = params.get("q") ?? "";

    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }
    if (!query.trim()) {
      return errorResponse("VALIDATION_ERROR", "q is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);
    const data = await searchOrganization(organizationId, user.id, query);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    if (error instanceof Error && error.message === "QUERY_REQUIRED") {
      return errorResponse("VALIDATION_ERROR", "q is required.", 400);
    }
    throw error;
  }
}
