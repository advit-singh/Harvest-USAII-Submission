import { AuthError, requireAuthenticatedUser } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { getConversationById } from "@/services/assistant/assistant-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const conversation = await getConversationById(id, user.id);

    if (!conversation) {
      return errorResponse("NOT_FOUND", "Conversation not found.", 404);
    }

    return successResponse(conversation);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
