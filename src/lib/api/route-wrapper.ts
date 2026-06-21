import { AuthError, requireAuthenticatedUser } from "@/lib/api/auth";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { errorResponse } from "@/lib/api/response";

export type AuthenticatedUser = Awaited<ReturnType<typeof requireAuthenticatedUser>>;

export interface RouteRateLimitOptions {
  keyPrefix: string;
  limit: number;
  windowMs: number;
}

export interface RouteHandlerOptions {
  rateLimit?: RouteRateLimitOptions;
  globalRateLimit?: RouteRateLimitOptions;
}

const DEFAULT_GLOBAL_LIMIT: RouteRateLimitOptions = {
  keyPrefix: "global",
  limit: 100,
  windowMs: 60_000,
};

export const AI_RATE_LIMIT: RouteRateLimitOptions = {
  keyPrefix: "ai",
  limit: 20,
  windowMs: 60_000,
};

export function withAuthenticatedRoute(
  handler: (request: Request, user: AuthenticatedUser) => Promise<Response>,
  options: RouteHandlerOptions = {},
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      const user = await requireAuthenticatedUser();

      const globalLimit = options.globalRateLimit ?? DEFAULT_GLOBAL_LIMIT;
      const globalCheck = checkRateLimit(
        `${globalLimit.keyPrefix}:${user.id}`,
        globalLimit.limit,
        globalLimit.windowMs,
      );
      if (!globalCheck.allowed) {
        return errorResponse("RATE_LIMITED", "Too many requests. Try again shortly.", 429);
      }

      if (options.rateLimit) {
        const aiCheck = checkRateLimit(
          `${options.rateLimit.keyPrefix}:${user.id}`,
          options.rateLimit.limit,
          options.rateLimit.windowMs,
        );
        if (!aiCheck.allowed) {
          return errorResponse("RATE_LIMITED", "Too many requests. Try again shortly.", 429);
        }
      }

      return await handler(request, user);
    } catch (error) {
      if (error instanceof AuthError) {
        return errorResponse(error.code, error.message, error.code === "UNAUTHORIZED" ? 401 : 403);
      }
      throw error;
    }
  };
}
