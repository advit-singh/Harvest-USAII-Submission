import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import { queueReportGeneration } from "@/services/report/report-service";
import type { GenerateReportPayload } from "@/types/report";

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as GenerateReportPayload;

    if (!body.organizationId || !body.template || !body.siteId || !body.format || !body.dateRange) {
      return errorResponse("VALIDATION_ERROR", "Invalid report generation payload.", 400);
    }

    await requireOrgMembership(body.organizationId, user.id);
    await requirePermission(body.organizationId, user.id, "reports.generate");

    const data = await queueReportGeneration(body, user.id);
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    if (error instanceof Error) {
      if (error.message === "INVALID_TEMPLATE") {
        return errorResponse("VALIDATION_ERROR", "Unknown report template.", 400);
      }
      if (error.message === "INVALID_FORMAT") {
        return errorResponse("VALIDATION_ERROR", "Format not supported for template.", 400);
      }
      if (error.message === "INVALID_SITE") {
        return errorResponse("VALIDATION_ERROR", "Site does not belong to organization.", 400);
      }
    }
    throw error;
  }
}
