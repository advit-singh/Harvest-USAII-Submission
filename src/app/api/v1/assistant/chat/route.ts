import { AuthError, requireAuthenticatedUser } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { errorResponse, successResponse } from "@/lib/api/response";
import { sendChatMessage } from "@/services/assistant/assistant-service";

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const limit = checkRateLimit(`assistant:${user.id}`, 20, 60_000);
    if (!limit.allowed) {
      return errorResponse("RATE_LIMITED", "Too many assistant requests. Try again shortly.", 429);
    }

    const body = (await request.json()) as { conversationId?: string; message?: string };
    if (!body.conversationId || !body.message?.trim()) {
      return errorResponse("VALIDATION_ERROR", "conversationId and message are required.", 400);
    }

    const data = await sendChatMessage(body.conversationId, user.id, body.message.trim());
    return successResponse(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    if (error instanceof Error && error.message === "CONVERSATION_NOT_FOUND") {
      return errorResponse("NOT_FOUND", "Conversation not found.", 404);
    }
    throw error;
  }
}
