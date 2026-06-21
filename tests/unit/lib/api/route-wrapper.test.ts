import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_USER_ID } from "../../../helpers/service-fixtures";

vi.mock("@/lib/api/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/auth")>();
  return {
    ...actual,
    requireAuthenticatedUser: vi.fn(),
  };
});

import { AuthError, requireAuthenticatedUser } from "@/lib/api/auth";
import { resetRateLimitBuckets } from "@/lib/api/rate-limit";
import { withAuthenticatedRoute } from "@/lib/api/route-wrapper";

describe("route-wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitBuckets();
  });

  afterEach(() => {
    resetRateLimitBuckets();
  });

  it("withAuthenticatedRoute invokes handler with authenticated user", async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: DEMO_USER_ID,
      email: "demo@harvest.local",
      user_metadata: { full_name: "Demo User" },
    } as never);

    const handler = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    const wrapped = withAuthenticatedRoute(handler);
    const response = await wrapped(new Request("http://localhost/api/test"));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[1]?.id).toBe(DEMO_USER_ID);
    expect(response.status).toBe(200);
  });

  it("withAuthenticatedRoute returns 401 for unauthorized users", async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValue(
      new AuthError("UNAUTHORIZED", "Authentication required."),
    );

    const handler = vi.fn();
    const wrapped = withAuthenticatedRoute(handler);
    const response = await wrapped(new Request("http://localhost/api/test"));
    const body = await response.json();

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("withAuthenticatedRoute returns 403 for forbidden auth errors", async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValue(
      new AuthError("FORBIDDEN", "User is not a member of this organization."),
    );

    const wrapped = withAuthenticatedRoute(vi.fn());
    const response = await wrapped(new Request("http://localhost/api/test"));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("withAuthenticatedRoute enforces route-specific rate limits", async () => {
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: DEMO_USER_ID,
      email: "demo@harvest.local",
    } as never);

    const handler = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    const wrapped = withAuthenticatedRoute(handler, {
      rateLimit: { keyPrefix: "ai", limit: 1, windowMs: 60_000 },
    });

    const request = new Request("http://localhost/api/ai");
    expect((await wrapped(request)).status).toBe(200);
    const limited = await wrapped(request);
    const body = await limited.json();

    expect(limited.status).toBe(429);
    expect(body.error.code).toBe("RATE_LIMITED");
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
