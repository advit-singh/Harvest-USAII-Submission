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

const analyticsService = vi.hoisted(() => ({
  getDashboardOverview: vi.fn(),
  getWasteAnalytics: vi.fn(),
  getAttendanceAnalytics: vi.fn(),
  getInventoryAnalytics: vi.fn(),
  getDonationAnalytics: vi.fn(),
  getImpactAnalytics: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/services/analytics/analytics-service", () => analyticsService);

import { GET as getOverview } from "@/app/api/v1/analytics/overview/route";
import { GET as getWaste } from "@/app/api/v1/analytics/waste/route";
import { GET as getAttendance } from "@/app/api/v1/analytics/attendance/route";
import { GET as getInventory } from "@/app/api/v1/analytics/inventory/route";
import { GET as getDonations } from "@/app/api/v1/analytics/donations/route";
import { GET as getImpact } from "@/app/api/v1/analytics/impact/route";

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
});

describe("GET /api/v1/analytics/overview", () => {
  it("returns dashboard overview on success", async () => {
    const overview = { wasteTrend: -5, donationCount: 12 };
    analyticsService.getDashboardOverview.mockResolvedValue(overview);

    const response = await getOverview(buildRequest(orgQueryUrl("/api/v1/analytics/overview")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(overview);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getOverview(buildRequest(orgQueryUrl("/api/v1/analytics/overview")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await getOverview(buildRequest("http://localhost:3000/api/v1/analytics/overview"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/analytics/waste", () => {
  it("returns waste analytics on success", async () => {
    const data = { totalWaste: 120, byCategory: [] };
    analyticsService.getWasteAnalytics.mockResolvedValue(data);

    const response = await getWaste(buildRequest(orgQueryUrl("/api/v1/analytics/waste")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(data);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getWaste(buildRequest(orgQueryUrl("/api/v1/analytics/waste")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await getWaste(buildRequest("http://localhost:3000/api/v1/analytics/waste"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/analytics/attendance", () => {
  it("returns attendance analytics on success", async () => {
    const data = { avgAttendance: 305, trend: 2 };
    analyticsService.getAttendanceAnalytics.mockResolvedValue(data);

    const response = await getAttendance(
      buildRequest(orgQueryUrl("/api/v1/analytics/attendance")),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(data);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getAttendance(
      buildRequest(orgQueryUrl("/api/v1/analytics/attendance")),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await getAttendance(
      buildRequest("http://localhost:3000/api/v1/analytics/attendance"),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/analytics/inventory", () => {
  it("returns inventory analytics on success", async () => {
    const data = { totalUnits: 500, expirationRisk: 8 };
    analyticsService.getInventoryAnalytics.mockResolvedValue(data);

    const response = await getInventory(
      buildRequest(orgQueryUrl("/api/v1/analytics/inventory")),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(data);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getInventory(
      buildRequest(orgQueryUrl("/api/v1/analytics/inventory")),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await getInventory(
      buildRequest("http://localhost:3000/api/v1/analytics/inventory"),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/analytics/donations", () => {
  it("returns donation analytics on success", async () => {
    const data = { mealsRescued: 240, matchRate: 0.82 };
    analyticsService.getDonationAnalytics.mockResolvedValue(data);

    const response = await getDonations(
      buildRequest(orgQueryUrl("/api/v1/analytics/donations")),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(data);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getDonations(
      buildRequest(orgQueryUrl("/api/v1/analytics/donations")),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await getDonations(
      buildRequest("http://localhost:3000/api/v1/analytics/donations"),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/analytics/impact", () => {
  it("returns impact analytics on success", async () => {
    const data = { co2Avoided: 150, mealsProvided: 320 };
    analyticsService.getImpactAnalytics.mockResolvedValue(data);

    const response = await getImpact(buildRequest(orgQueryUrl("/api/v1/analytics/impact")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(data);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getImpact(buildRequest(orgQueryUrl("/api/v1/analytics/impact")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await getImpact(buildRequest("http://localhost:3000/api/v1/analytics/impact"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});
