import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { createRecipient, listRecipients } from "@/services/donation/recipient-service";
import type { CreateRecipientPayload } from "@/types/recipient";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const organizationId = new URL(request.url).searchParams.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }
    await requireOrgMembership(organizationId, user.id);
    const data = await listRecipients(organizationId);
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
    const organizationId = new URL(request.url).searchParams.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }
    await requireOrgMembership(organizationId, user.id);

    const body = (await request.json()) as CreateRecipientPayload;
    if (!body.name || !body.type) {
      return errorResponse("VALIDATION_ERROR", "name and type are required.", 400);
    }

    const data = await createRecipient({
      organizationId,
      name: body.name,
      type: body.type,
      distanceKm: body.distanceKm ?? 5,
      capacityMeals: body.capacityMeals ?? 100,
      foodTypesAccepted: body.foodTypesAccepted ?? [],
      availability: body.availability ?? "Weekdays",
      operatingHours: body.operatingHours ?? "Mon–Fri 8:00–18:00",
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      address: body.address,
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
