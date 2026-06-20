import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { getDefaultSiteForOrg } from "@/lib/api/org-context";
import { errorResponse, successResponse } from "@/lib/api/response";
import { runSimulation } from "@/services/simulation/simulation-service";
import { db } from "@/db/client";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;

    const row = await db.query.simulations.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, id),
    });

    if (!row) {
      return errorResponse("NOT_FOUND", "Simulation not found.", 404);
    }

    await requireOrgMembership(row.organization_id, user.id);

    const siteId = await getDefaultSiteForOrg(row.organization_id);
    if (!siteId) {
      return errorResponse("INVALID_TARGET", "No site found for organization.", 400);
    }

    const result = await runSimulation(id, row.organization_id, siteId, user.id);
    if (!result) {
      return errorResponse("SIMULATION_FAILED", "Simulation run failed.", 500);
    }

    return successResponse(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    return errorResponse(
      "SIMULATION_FAILED",
      error instanceof Error ? error.message : "Simulation run failed.",
      500,
    );
  }
}
