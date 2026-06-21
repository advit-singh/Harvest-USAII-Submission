import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  getInventoryItemById,
  updateInventoryItem,
} from "@/services/operational/inventory-api-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const organizationId = new URL(request.url).searchParams.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);
    const data = await getInventoryItemById(id, organizationId);
    if (!data) {
      return errorResponse("NOT_FOUND", "Inventory item not found.", 404);
    }
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as {
      organizationId?: string;
      name?: string;
      description?: string;
      defaultCost?: string;
    };

    if (!body.organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(body.organizationId, user.id);
    await requirePermission(body.organizationId, user.id, "uploads.manage");

    const data = await updateInventoryItem(id, body.organizationId, body);
    if (!data) {
      return errorResponse("NOT_FOUND", "Inventory item not found.", 404);
    }
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
