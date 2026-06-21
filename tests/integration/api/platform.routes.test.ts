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

const organizationService = vi.hoisted(() => ({
  listOrganizationsForUser: vi.fn(),
  createOrganization: vi.fn(),
}));

const userService = vi.hoisted(() => ({
  getCurrentUserProfile: vi.fn(),
  updateCurrentUserProfile: vi.fn(),
}));

const notificationService = vi.hoisted(() => ({
  listNotifications: vi.fn(),
}));

const searchService = vi.hoisted(() => ({
  searchOrganization: vi.fn(),
}));

const auditService = vi.hoisted(() => ({
  listAuditLogs: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/lib/api/permissions", () => ({
  requirePermission: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/organization/organization-service", () => organizationService);
vi.mock("@/services/user/user-service", () => userService);
vi.mock("@/services/notification/notification-service", () => notificationService);
vi.mock("@/services/search/search-service", () => searchService);
vi.mock("@/services/platform/audit-service", () => auditService);

import { GET as listOrganizations, POST as createOrganization } from "@/app/api/v1/organizations/route";
import { GET as getMe, PATCH as updateMe } from "@/app/api/v1/users/me/route";
import { GET as listNotifications } from "@/app/api/v1/notifications/route";
import { GET as search } from "@/app/api/v1/search/route";
import { GET as listAudit } from "@/app/api/v1/audit/route";

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
});

describe("GET /api/v1/organizations", () => {
  it("returns organizations for user on success", async () => {
    const orgs = [{ id: DEMO_ORG_ID, name: "Demo District" }];
    organizationService.listOrganizationsForUser.mockResolvedValue(orgs);

    const response = await listOrganizations();
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(orgs);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listOrganizations();
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });
});

describe("POST /api/v1/organizations", () => {
  it("creates organization on success", async () => {
    const created = { id: DEMO_ORG_ID, name: "New School" };
    organizationService.createOrganization.mockResolvedValue({ organization: created });

    const response = await createOrganization(
      buildRequest("http://localhost:3000/api/v1/organizations", {
        method: "POST",
        body: { name: "New School", type: "school_district", timezone: "America/Chicago" },
      }),
    );
    const body = await expectSuccessEnvelope(response, 201);
    expect(body.data).toEqual(created);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await createOrganization(
      buildRequest("http://localhost:3000/api/v1/organizations", {
        method: "POST",
        body: { name: "New School", type: "school_district", timezone: "America/Chicago" },
      }),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await createOrganization(
      buildRequest("http://localhost:3000/api/v1/organizations", {
        method: "POST",
        body: { name: "Incomplete" },
      }),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/users/me", () => {
  it("returns current user profile on success", async () => {
    const profile = { id: "user-1", email: "demo@harvest.local", fullName: "Demo User" };
    userService.getCurrentUserProfile.mockResolvedValue(profile);

    const response = await getMe();
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(profile);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getMe();
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 404 when profile does not exist", async () => {
    userService.getCurrentUserProfile.mockResolvedValue(null);

    const response = await getMe();
    await expectErrorEnvelope(response, "NOT_FOUND", 404);
  });
});

describe("PATCH /api/v1/users/me", () => {
  it("updates profile on success", async () => {
    const updated = { id: "user-1", fullName: "Updated Name" };
    userService.updateCurrentUserProfile.mockResolvedValue(updated);

    const response = await updateMe(
      buildRequest("http://localhost:3000/api/v1/users/me", {
        method: "PATCH",
        body: { fullName: "Updated Name" },
      }),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(updated);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await updateMe(
      buildRequest("http://localhost:3000/api/v1/users/me", {
        method: "PATCH",
        body: { fullName: "Updated Name" },
      }),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });
});

describe("GET /api/v1/notifications", () => {
  it("returns notifications on success", async () => {
    const notifications = [{ id: "n-1", title: "New recommendation" }];
    notificationService.listNotifications.mockResolvedValue(notifications);

    const response = await listNotifications(buildRequest(orgQueryUrl("/api/v1/notifications")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(notifications);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listNotifications(buildRequest(orgQueryUrl("/api/v1/notifications")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listNotifications(buildRequest("http://localhost:3000/api/v1/notifications"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/search", () => {
  it("returns search results on success", async () => {
    const results = { items: [{ type: "recommendation", id: "rec-1" }] };
    searchService.searchOrganization.mockResolvedValue(results);

    const response = await search(
      buildRequest(`${orgQueryUrl("/api/v1/search")}&q=waste`),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(results);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await search(
      buildRequest(`${orgQueryUrl("/api/v1/search")}&q=waste`),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when query is missing", async () => {
    const response = await search(buildRequest(orgQueryUrl("/api/v1/search")));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/audit", () => {
  it("returns audit logs on success", async () => {
    const logs = [{ id: "log-1", action: "user.login" }];
    auditService.listAuditLogs.mockResolvedValue(logs);

    const response = await listAudit(buildRequest(orgQueryUrl("/api/v1/audit")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(logs);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listAudit(buildRequest(orgQueryUrl("/api/v1/audit")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listAudit(buildRequest("http://localhost:3000/api/v1/audit"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});
