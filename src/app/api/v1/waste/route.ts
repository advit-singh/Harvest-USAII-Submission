import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import { createWasteRecord, listWasteRecords } from "@/services/operational/waste-api-service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const startDate = params.get("startDate");
    const endDate = params.get("endDate");

    const data = await listWasteRecords({
      organizationId,
      siteId: params.get("siteId") ?? undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
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
    const body = (await request.json()) as {
      organizationId?: string;
      siteId?: string;
      inventoryItemId?: string;
      quantity?: string;
      unit?: string;
      wasteReason?: string;
      wasteDate?: string;
    };

    if (
      !body.organizationId ||
      !body.siteId ||
      !body.quantity ||
      !body.unit ||
      !body.wasteReason ||
      !body.wasteDate
    ) {
      return errorResponse(
        "VALIDATION_ERROR",
        "organizationId, siteId, quantity, unit, wasteReason, and wasteDate are required.",
        400,
      );
    }

    await requireOrgMembership(body.organizationId, user.id);
    await requirePermission(body.organizationId, user.id, "uploads.manage");

    const data = await createWasteRecord({
      organizationId: body.organizationId,
      siteId: body.siteId,
      inventoryItemId: body.inventoryItemId,
      quantity: body.quantity,
      unit: body.unit,
      wasteReason: body.wasteReason,
      wasteDate: new Date(body.wasteDate),
      createdBy: user.id,
    });
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
