import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { getDefaultOrgContext } from "@/lib/api/org-context";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  createCustomRole,
  listRoles,
  resolveOrganizationIdForRoles,
} from "@/services/organization/role-service";
import type { PermissionId } from "@/types/settings";

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const params = new URL(request.url).searchParams;
    const organizationId = params.get("organizationId");
    const includePermissions = params.get("include") === "permissions";

    const orgId = await resolveOrganizationIdForRoles(user.id, organizationId);
    await requireOrgMembership(orgId, user.id);

    const data = await listRoles(orgId, includePermissions);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    if (error instanceof Error && error.message === "ORGANIZATION_REQUIRED") {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as {
      organizationId?: string;
      name?: string;
      description?: string;
      permissionIds?: PermissionId[];
    };

    const orgId =
      body.organizationId ??
      (await getDefaultOrgContext(user.id))?.organizationId;
    if (!orgId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(orgId, user.id);
    await requirePermission(orgId, user.id, "users.manage");

    if (!body.name || !body.permissionIds?.length) {
      return errorResponse("VALIDATION_ERROR", "name and permissionIds are required.", 400);
    }

    const data = await createCustomRole(
      orgId,
      {
        name: body.name,
        description: body.description,
        permissionIds: body.permissionIds,
      },
      user.id,
    );
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    if (error instanceof Error && error.message === "INVALID_PERMISSION") {
      return errorResponse("VALIDATION_ERROR", "Invalid permission id.", 400);
    }
    throw error;
  }
}
