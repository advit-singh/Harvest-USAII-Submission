import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from "@/services/organization/settings-service";
import type { OrganizationSettingsPatch } from "@/types/settings";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    await requireOrgMembership(id, user.id);

    const data = await getOrganizationSettings(id);
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
    await requireOrgMembership(id, user.id);
    await requirePermission(id, user.id, "settings.manage");

    const body = (await request.json()) as OrganizationSettingsPatch;
    const data = await updateOrganizationSettings(id, body, user.id);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
