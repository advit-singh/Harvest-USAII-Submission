import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRequest,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  mockAuthSuccess,
  orgQueryUrl,
  TestAuthError,
} from "../../helpers/api-test-utils";
import { DEMO_ORG_ID } from "../../helpers/service-fixtures";

const authMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  requireOrgMembership: vi.fn(),
}));

const impactService = vi.hoisted(() => ({
  getImpactMetrics: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/services/impact/impact-service", () => impactService);

import { GET as getImpact } from "@/app/api/v1/impact/route";

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
});

describe("GET /api/v1/impact", () => {
  it("returns impact metrics on success", async () => {
    const metrics = {
      mealsRescued: 500,
      co2AvoidedKg: 1200,
      waterSavedLiters: 8000,
    };
    impactService.getImpactMetrics.mockResolvedValue(metrics);

    const response = await getImpact(buildRequest(orgQueryUrl("/api/v1/impact")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(metrics);
    expect(impactService.getImpactMetrics).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: DEMO_ORG_ID, timeRange: "month" }),
    );
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getImpact(buildRequest(orgQueryUrl("/api/v1/impact")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await getImpact(buildRequest("http://localhost:3000/api/v1/impact"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});
