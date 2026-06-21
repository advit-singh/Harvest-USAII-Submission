import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  createSchedule,
  listSchedules,
} from "@/services/report/schedule-service";
import type { CreateReportSchedulePayload } from "@/types/report";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }
    await requireOrgMembership(organizationId, user.id);

    const data = await listSchedules(organizationId);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as CreateReportSchedulePayload;

    if (!body.organizationId || !body.siteId || !body.template || !body.format || !body.cadence) {
      return errorResponse(
        "VALIDATION_ERROR",
        "organizationId, siteId, template, format, and cadence are required.",
        400,
      );
    }

    await requireOrgMembership(body.organizationId, user.id);
    await requirePermission(body.organizationId, user.id, "reports.generate");

    const data = await createSchedule(
      {
        ...body,
        timezone: body.timezone ?? "UTC",
      },
      user.id,
    );
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    if (error instanceof Error) {
      if (error.message === "INVALID_TEMPLATE") {
        return errorResponse("VALIDATION_ERROR", "Invalid report template.", 400);
      }
      if (error.message === "INVALID_SITE") {
        return errorResponse("VALIDATION_ERROR", "Invalid site.", 400);
      }
    }
    throw error;
  }
}
