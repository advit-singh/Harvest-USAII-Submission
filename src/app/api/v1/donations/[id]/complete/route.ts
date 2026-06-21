import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { completeDonation } from "@/services/donation/donation-service";
import type { DonationCompletionPayload } from "@/types/donation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;
    const organizationId = new URL(request.url).searchParams.get("organizationId");
    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }
    await requireOrgMembership(organizationId, user.id);

    const body = (await request.json()) as DonationCompletionPayload;
    if (!body.recipientId) {
      return errorResponse("VALIDATION_ERROR", "recipientId is required.", 400);
    }

    try {
      const data = await completeDonation(id, organizationId, body, user.id);
      if (!data) {
        return errorResponse("NOT_FOUND", "Donation opportunity not found.", 404);
      }
      return successResponse(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Completion failed";
      return errorResponse("VALIDATION_ERROR", message, 400);
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
