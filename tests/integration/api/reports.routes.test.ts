import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRequest,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  mockAuthSuccess,
  orgQueryUrl,
  TestAuthError,
} from "../../helpers/api-test-utils";
import { DEMO_ORG_ID, DEMO_REPORT_ID, DEMO_SITE_ID } from "../../helpers/service-fixtures";

const authMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  requireOrgMembership: vi.fn(),
}));

const reportService = vi.hoisted(() => ({
  listReports: vi.fn(),
  getTemplates: vi.fn(),
  queueReportGeneration: vi.fn(),
  getReportById: vi.fn(),
  downloadReport: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/lib/api/permissions", () => ({
  requirePermission: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/report/report-service", () => reportService);

vi.mock("@/db/client", () => ({
  db: {
    query: {
      reports: {
        findFirst: dbMocks.findFirst,
      },
    },
  },
}));

import { GET as listReports } from "@/app/api/v1/reports/route";
import { GET as getTemplates } from "@/app/api/v1/reports/templates/route";
import { POST as generateReport } from "@/app/api/v1/reports/generate/route";
import { GET as getReport } from "@/app/api/v1/reports/[id]/route";
import { GET as downloadReport } from "@/app/api/v1/reports/[id]/download/route";

const params = Promise.resolve({ id: DEMO_REPORT_ID });
const validGeneratePayload = {
  organizationId: DEMO_ORG_ID,
  template: "monthly_summary" as const,
  siteId: DEMO_SITE_ID,
  format: "pdf" as const,
  dateRange: { preset: "month" as const, start: "2026-01-01", end: "2026-01-31" },
};

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
  dbMocks.findFirst.mockResolvedValue({ id: DEMO_REPORT_ID, organization_id: DEMO_ORG_ID });
});

describe("GET /api/v1/reports", () => {
  it("returns report list on success", async () => {
    const reports = [{ id: DEMO_REPORT_ID, status: "ready" }];
    reportService.listReports.mockResolvedValue(reports);

    const response = await listReports(buildRequest(orgQueryUrl("/api/v1/reports")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(reports);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listReports(buildRequest(orgQueryUrl("/api/v1/reports")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listReports(buildRequest("http://localhost:3000/api/v1/reports"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/reports/templates", () => {
  it("returns report templates on success", async () => {
    const templates = [{ id: "monthly_summary", name: "Monthly Summary" }];
    reportService.getTemplates.mockReturnValue(templates);

    const response = await getTemplates(buildRequest(orgQueryUrl("/api/v1/reports/templates")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(templates);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getTemplates(buildRequest(orgQueryUrl("/api/v1/reports/templates")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });
});

describe("POST /api/v1/reports/generate", () => {
  it("queues report generation on success", async () => {
    const queued = { id: DEMO_REPORT_ID, status: "queued" };
    reportService.queueReportGeneration.mockResolvedValue(queued);

    const response = await generateReport(
      buildRequest("http://localhost:3000/api/v1/reports/generate", {
        method: "POST",
        body: validGeneratePayload,
      }),
    );
    const body = await expectSuccessEnvelope(response, 201);
    expect(body.data).toEqual(queued);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await generateReport(
      buildRequest("http://localhost:3000/api/v1/reports/generate", {
        method: "POST",
        body: validGeneratePayload,
      }),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 for invalid generation payload", async () => {
    const response = await generateReport(
      buildRequest("http://localhost:3000/api/v1/reports/generate", {
        method: "POST",
        body: { organizationId: DEMO_ORG_ID },
      }),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/reports/[id]", () => {
  it("returns report detail on success", async () => {
    const report = { id: DEMO_REPORT_ID, template: "monthly_summary" };
    reportService.getReportById.mockResolvedValue(report);

    const response = await getReport(
      buildRequest(orgQueryUrl(`/api/v1/reports/${DEMO_REPORT_ID}`)),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(report);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getReport(
      buildRequest(orgQueryUrl(`/api/v1/reports/${DEMO_REPORT_ID}`)),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 404 when report does not exist", async () => {
    reportService.getReportById.mockResolvedValue(null);

    const response = await getReport(
      buildRequest(orgQueryUrl(`/api/v1/reports/${DEMO_REPORT_ID}`)),
      { params },
    );
    await expectErrorEnvelope(response, "NOT_FOUND", 404);
  });
});

describe("GET /api/v1/reports/[id]/download", () => {
  it("returns download info on success", async () => {
    const download = { url: "https://example.com/report.pdf", format: "pdf" };
    reportService.downloadReport.mockResolvedValue(download);

    const response = await downloadReport(
      buildRequest(orgQueryUrl(`/api/v1/reports/${DEMO_REPORT_ID}/download`)),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(download);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await downloadReport(
      buildRequest(orgQueryUrl(`/api/v1/reports/${DEMO_REPORT_ID}/download`)),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when report is not ready", async () => {
    reportService.downloadReport.mockResolvedValue(null);

    const response = await downloadReport(
      buildRequest(orgQueryUrl(`/api/v1/reports/${DEMO_REPORT_ID}/download`)),
      { params },
    );
    await expectErrorEnvelope(response, "REPORT_NOT_READY", 400);
  });
});
