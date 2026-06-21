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

const permissionMocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
}));

const scheduleService = vi.hoisted(() => ({
  listSchedules: vi.fn(),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
  processDueSchedules: vi.fn(),
}));

const siteService = vi.hoisted(() => ({
  listSitesForOrg: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/lib/api/permissions", () => permissionMocks);

vi.mock("@/services/report/schedule-service", () => scheduleService);
vi.mock("@/services/organization/site-service", () => siteService);

import { GET as listSchedules, POST as createSchedule } from "@/app/api/v1/reports/schedules/route";
import { PATCH as updateSchedule, DELETE as deleteSchedule } from "@/app/api/v1/reports/schedules/[id]/route";
import { POST as runDue } from "@/app/api/v1/reports/schedules/run-due/route";
import { GET as listSites } from "@/app/api/v1/organizations/[id]/sites/route";

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
  permissionMocks.requirePermission.mockResolvedValue(undefined);
});

describe("GET /api/v1/reports/schedules", () => {
  it("returns schedules for organization", async () => {
    const schedules = [{ id: "sched_1", organizationId: DEMO_ORG_ID }];
    scheduleService.listSchedules.mockResolvedValue(schedules);

    const response = await listSchedules(
      buildRequest(orgQueryUrl("/api/v1/reports/schedules", DEMO_ORG_ID)),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(schedules);
  });
});

describe("POST /api/v1/reports/schedules", () => {
  it("creates schedule on success", async () => {
    const payload = {
      organizationId: DEMO_ORG_ID,
      siteId: "site_1",
      template: "monthly_summary",
      format: "pdf",
      cadence: "weekly",
      timezone: "UTC",
    };
    const created = { id: "sched_1", ...payload };
    scheduleService.createSchedule.mockResolvedValue(created);

    const response = await createSchedule(
      buildRequest("http://localhost:3000/api/v1/reports/schedules", { method: "POST", body: payload }),
    );
    const body = await expectSuccessEnvelope(response, 201);
    expect(body.data).toEqual(created);
  });
});

describe("PATCH /api/v1/reports/schedules/:id", () => {
  it("updates schedule", async () => {
    scheduleService.updateSchedule.mockResolvedValue({ id: "sched_1", isActive: false });

    const response = await updateSchedule(
      buildRequest("http://localhost:3000/api/v1/reports/schedules/sched_1", {
        method: "PATCH",
        body: { organizationId: DEMO_ORG_ID, isActive: false },
      }),
      { params: Promise.resolve({ id: "sched_1" }) },
    );
    const body = await expectSuccessEnvelope(response);
    expect((body.data as { isActive: boolean }).isActive).toBe(false);
  });
});

describe("DELETE /api/v1/reports/schedules/:id", () => {
  it("deletes schedule", async () => {
    scheduleService.deleteSchedule.mockResolvedValue(true);

    const response = await deleteSchedule(
      buildRequest(
        orgQueryUrl("/api/v1/reports/schedules/sched_1", DEMO_ORG_ID),
        { method: "DELETE" },
      ),
      { params: Promise.resolve({ id: "sched_1" }) },
    );
    const body = await expectSuccessEnvelope(response);
    expect((body.data as { id: string }).id).toBe("sched_1");
  });
});

describe("POST /api/v1/reports/schedules/run-due", () => {
  it("processes due schedules", async () => {
    scheduleService.processDueSchedules.mockResolvedValue({ processed: 1, reportIds: ["rpt_1"] });

    const response = await runDue(
      buildRequest("http://localhost:3000/api/v1/reports/schedules/run-due", {
        method: "POST",
        body: { organizationId: DEMO_ORG_ID },
      }),
    );
    const body = await expectSuccessEnvelope(response);
    expect((body.data as { processed: number }).processed).toBe(1);
  });
});

describe("GET /api/v1/organizations/:id/sites", () => {
  it("returns sites for organization", async () => {
    const sites = [{ id: "site_1", name: "Main Kitchen" }];
    siteService.listSitesForOrg.mockResolvedValue(sites);

    const response = await listSites(
      buildRequest(`http://localhost:3000/api/v1/organizations/${DEMO_ORG_ID}/sites`),
      { params: Promise.resolve({ id: DEMO_ORG_ID }) },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(sites);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );
    const response = await listSites(
      buildRequest(`http://localhost:3000/api/v1/organizations/${DEMO_ORG_ID}/sites`),
      { params: Promise.resolve({ id: DEMO_ORG_ID }) },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });
});
