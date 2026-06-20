import { z } from "zod";
import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { compareSimulations } from "@/services/simulation/simulation-service";
import { db } from "@/db/client";

const compareSchema = z.object({
  simulationIds: z.array(z.string().uuid()).min(2),
  organizationId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = compareSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid simulation compare payload.", 400);
    }

    const firstSim = await db.query.simulations.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, parsed.data.simulationIds[0]),
    });

    if (!firstSim) {
      return errorResponse("NOT_FOUND", "Simulation not found.", 404);
    }

    const organizationId = parsed.data.organizationId ?? firstSim.organization_id;
    await requireOrgMembership(organizationId, user.id);

    const comparison = await compareSimulations(parsed.data.simulationIds, organizationId);
    return successResponse(comparison);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    return errorResponse(
      "SIMULATION_FAILED",
      error instanceof Error ? error.message : "Simulation compare failed.",
      400,
    );
  }
}
