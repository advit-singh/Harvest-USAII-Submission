import { AuthError, requireAuthenticatedUser } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  createOrganization,
  listOrganizationsForUser,
} from "@/services/organization/organization-service";
import type { CreateOrganizationInput } from "@/types/organization";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const data = await listOrganizationsForUser(user.id);
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
    const body = (await request.json()) as CreateOrganizationInput;

    if (!body.name || !body.type || !body.timezone) {
      return errorResponse("VALIDATION_ERROR", "name, type, and timezone are required.", 400);
    }

    const result = await createOrganization(body, user.id);
    return successResponse(result.organization, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
