import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { getTemplates } from "@/services/report/report-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const organizationId = new URL(request.url).searchParams.get("organizationId");
    if (organizationId) {
      await requireOrgMembership(organizationId, user.id);
    }
    return successResponse(getTemplates());
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
