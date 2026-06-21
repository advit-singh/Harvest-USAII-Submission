import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { requirePermission } from "@/lib/api/permissions";
import { errorResponse, successResponse } from "@/lib/api/response";
import { removeMember } from "@/services/organization/member-service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const { id, memberId } = await params;
    const user = await requireAuthenticatedUser();
    await requireOrgMembership(id, user.id);
    await requirePermission(id, user.id, "users.manage");

    await removeMember(id, memberId, user.id);
    return successResponse({ removed: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    if (error instanceof Error && error.message === "MEMBER_NOT_FOUND") {
      return errorResponse("NOT_FOUND", "Member not found.", 404);
    }
    throw error;
  }
}
