import { z } from "zod";
import { AuthError, requireAuthenticatedUser, requireOrgMembership } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { errorResponse, successResponse } from "@/lib/api/response";
import { generateForecast } from "@/services/forecast/forecast-service";

const generateSchema = z.object({
  organizationId: z.string().uuid(),
  siteId: z.string().uuid(),
  forecastType: z.enum(["surplus", "waste", "demand"]),
  days: z.number().int().min(1).max(90),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const aiLimit = checkRateLimit(`ai:forecast:${user.id}`, 20, 60_000);
    if (!aiLimit.allowed) {
      return errorResponse("RATE_LIMITED", "Too many forecast requests. Try again shortly.", 429);
    }

    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid forecast generation payload.", 400);
    }

    await requireOrgMembership(parsed.data.organizationId, user.id);

    const result = await generateForecast({
      ...parsed.data,
      createdBy: user.id,
    });

    return successResponse(result, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
    }
    return errorResponse(
      "FORECAST_FAILED",
      error instanceof Error ? error.message : "Forecast generation failed.",
      500,
    );
  }
}
