import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { listReports } from "@/services/report/report-service";
import type { ReportFilters } from "@/types/report";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }
    await requireOrgMembership(organizationId, user.id);

    const filters: ReportFilters = {
      organizationId,
      status: (params.get("status") as ReportFilters["status"]) ?? "all",
      template: (params.get("template") as ReportFilters["template"]) ?? "all",
      siteId: params.get("siteId") ?? "all",
    };

    const data = await listReports(filters);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
