import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { listInventoryLots } from "@/services/operational/inventory-api-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const expiringBefore = params.get("expiringBefore");
    const data = await listInventoryLots({
      organizationId,
      siteId: params.get("siteId") ?? undefined,
      expiringBefore: expiringBefore ? new Date(expiringBefore) : undefined,
      minQuantity: params.get("minQuantity") ? Number(params.get("minQuantity")) : undefined,
    });
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
