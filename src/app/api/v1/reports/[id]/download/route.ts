import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { db } from "@/db/client";
import { downloadReport } from "@/services/report/report-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    let organizationId = new URL(request.url).searchParams.get("organizationId");

    if (!organizationId) {
      const row = await db.query.reports.findFirst({
        where: (fields, { eq: eqFn }) => eqFn(fields.id, id),
      });
      if (!row) {
        return errorResponse("NOT_FOUND", "Report not found.", 404);
      }
      organizationId = row.organization_id;
    }

    await requireOrgMembership(organizationId, user.id);

    const data = await downloadReport(id, organizationId);
    if (!data) {
      return errorResponse("REPORT_NOT_READY", "Report is not ready for download.", 400);
    }

    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
