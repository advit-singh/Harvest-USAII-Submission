import { AuthError, requireAuthenticatedUser } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import { processDueSchedules } from "@/services/report/schedule-service";

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

    let organizationId: string | undefined;
    if (!isCron) {
      const user = await requireAuthenticatedUser();
      const body = (await request.json().catch(() => ({}))) as {
        organizationId?: string;
      };
      organizationId = body.organizationId;
      if (!organizationId) {
        return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
      }
      await requirePermission(organizationId, user.id, "reports.generate");
    }

    const data = await processDueSchedules(organizationId);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
