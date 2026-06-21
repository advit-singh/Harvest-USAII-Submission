import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import { inviteMember, listMembers } from "@/services/organization/member-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    await requireOrgMembership(id, user.id);

    const data = await listMembers(id);
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    await requireOrgMembership(id, user.id);
    await requirePermission(id, user.id, "users.manage");

    const body = (await request.json()) as { email?: string; roleId?: string };
    if (!body.email || !body.roleId) {
      return errorResponse("VALIDATION_ERROR", "email and roleId are required.", 400);
    }

    const data = await inviteMember(id, body.email, body.roleId, user.id);
    return successResponse(data, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    if (error instanceof Error) {
      if (error.message === "ROLE_NOT_FOUND") {
        return errorResponse("NOT_FOUND", "Role not found.", 404);
      }
      if (error.message === "MEMBER_EXISTS") {
        return errorResponse("VALIDATION_ERROR", "Member already exists.", 400);
      }
    }
    throw error;
  }
}
