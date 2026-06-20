import { z } from "zod";
import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { getDefaultOrgContext } from "@/lib/api/org-context";
import { errorResponse, successResponse } from "@/lib/api/response";
import { previewSimulation } from "@/services/simulation/simulation-service";

const previewSchema = z.object({
  organizationId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  changes: z.record(z.number()).default({}),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = previewSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid simulation preview payload.", 400);
    }

    let organizationId = parsed.data.organizationId;
    let siteId = parsed.data.siteId;

    if (!organizationId || !siteId) {
      const context = await getDefaultOrgContext(user.id);
      if (!context?.organizationId || !context.siteId) {
        return errorResponse(
          "VALIDATION_ERROR",
          "organizationId and siteId are required when no default org context exists.",
          400,
        );
      }
      organizationId = organizationId ?? context.organizationId;
      siteId = siteId ?? context.siteId;
    }

    await requireOrgMembership(organizationId, user.id);

    const result = await previewSimulation(
      organizationId,
      siteId,
      parsed.data.changes,
    );

    return successResponse(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    return errorResponse(
      "SIMULATION_FAILED",
      error instanceof Error ? error.message : "Simulation preview failed.",
      500,
    );
  }
}
