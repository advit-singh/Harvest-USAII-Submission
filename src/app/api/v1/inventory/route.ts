import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { listInventoryItems } from "@/services/operational/inventory-api-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const data = await listInventoryItems({
      organizationId,
      siteId: params.get("siteId") ?? undefined,
      categoryId: params.get("categoryId") ?? undefined,
      search: params.get("search") ?? undefined,
      expiringSoon: params.get("expiringSoon") === "true",
    });
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
