import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { getForecastById } from "@/services/forecast/forecast-service";
import { db } from "@/db/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;

    const row = await db.query.forecasts.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, id),
    });

    if (!row) {
      return errorResponse("NOT_FOUND", "Forecast not found.", 404);
    }

    await requireOrgMembership(row.organization_id, user.id);

    const forecast = await getForecastById(id, row.organization_id);
    if (!forecast) {
      return errorResponse("NOT_FOUND", "Forecast not found.", 404);
    }

    return successResponse(forecast);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
