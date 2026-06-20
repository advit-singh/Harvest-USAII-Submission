import { z } from "zod";
import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/response";
import { createSimulation, listSimulations } from "@/services/simulation/simulation-service";

const createSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1),
  changes: z.record(z.number()).optional(),
});

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
      return errorResponse("VALIDATION_ERROR", "organizationId is required.", 400);
    }

    await requireOrgMembership(organizationId, user.id);

    const simulations = await listSimulations(organizationId);
    return successResponse(simulations);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid simulation payload.", 400);
    }

    await requireOrgMembership(parsed.data.organizationId, user.id);

    const simulation = await createSimulation(
      parsed.data.organizationId,
      user.id,
      {
        name: parsed.data.name,
        changes: parsed.data.changes ?? {},
      },
    );

    return successResponse(simulation, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    throw error;
  }
}
