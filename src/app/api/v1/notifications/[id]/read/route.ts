import { AuthError, requireAuthenticatedUser } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { markNotificationRead } from "@/services/notification/notification-service";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireAuthenticatedUser();
    const data = await markNotificationRead(id, user.id);
    if (!data) {
      return errorResponse("NOT_FOUND", "Notification not found.", 404);
    }
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
