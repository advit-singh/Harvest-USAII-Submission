import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { listForecasts } from "@/services/forecast/forecast-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const forecasts = await listForecasts({
      organizationId,
      forecastType: url.searchParams.get("forecastType") ?? undefined,
      siteId: url.searchParams.get("siteId") ?? undefined,
      startDate: url.searchParams.get("startDate") ?? undefined,
      endDate: url.searchParams.get("endDate") ?? undefined,
    });

    return successResponse(forecasts);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
