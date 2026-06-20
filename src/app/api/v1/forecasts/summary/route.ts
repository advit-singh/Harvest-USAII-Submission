import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { getForecastSummaryKpis } from "@/services/forecast/forecast-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const kpis = await getForecastSummaryKpis(
      organizationId,
      url.searchParams.get("siteId") ?? undefined,
    );

    return successResponse(kpis);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
