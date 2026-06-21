import { AuthError, requireAuthenticatedUser } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "@/services/user/user-service";
import type { UpdateUserProfileInput } from "@/types/user";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const profile = await getCurrentUserProfile(user.id);
    if (!profile) {
      return errorResponse("NOT_FOUND", "User profile not found.", 404);
    }
    return successResponse(profile);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = (await request.json()) as UpdateUserProfileInput;
    const profile = await updateCurrentUserProfile(user.id, body);
    return successResponse(profile);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return errorResponse("NOT_FOUND", "User profile not found.", 404);
    }
    throw error;
  }
}
