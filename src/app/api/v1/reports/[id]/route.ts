import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { db } from "@/db/client";
import { getReportById } from "@/services/report/report-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const organizationId = new URL(_request.url).searchParams.get("organizationId");

    let resolvedOrgId = organizationId;
    if (!resolvedOrgId) {
      const row = await db.query.reports.findFirst({
        where: (fields, { eq: eqFn }) => eqFn(fields.id, id),
      });
      if (!row) {
        return errorResponse("NOT_FOUND", "Report not found.", 404);
      }
      resolvedOrgId = row.organization_id;
    }

    await requireOrgMembership(resolvedOrgId, user.id);

    const report = await getReportById(id, resolvedOrgId);

    if (!report) {
      return errorResponse("NOT_FOUND", "Report not found.", 404);
    }

    return successResponse(report);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
