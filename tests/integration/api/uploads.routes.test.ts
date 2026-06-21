import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRequest,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  mockAuthSuccess,
  orgQueryUrl,
  TestAuthError,
} from "../../helpers/api-test-utils";
import { DEMO_ORG_ID, DEMO_SITE_ID } from "../../helpers/service-fixtures";

const authMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  requireOrgMembership: vi.fn(),
}));

const uploadService = vi.hoisted(() => ({
  listUploads: vi.fn(),
  getUploadById: vi.fn(),
  updateUploadStatus: vi.fn(),
}));

const pipelineService = vi.hoisted(() => ({
  runUploadPipeline: vi.fn(),
}));

const orchestrationService = vi.hoisted(() => ({
  finalizeUpload: vi.fn(),
}));

const UPLOAD_ID = "00000000-0000-4000-8000-000000000070";

const mockUpload = {
  id: UPLOAD_ID,
  organization_id: DEMO_ORG_ID,
  site_id: DEMO_SITE_ID,
  file_name: "inventory.csv",
  file_type: "text/csv",
  file_size: 1024,
  processing_status: "review_required",
  classification: "inventory",
  confidence_score: 0.92,
  created_at: new Date("2026-01-01"),
  updated_at: new Date("2026-01-01"),
};

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/services/upload/upload-service", () => uploadService);
vi.mock("@/services/upload/pipeline-service", () => pipelineService);
vi.mock("@/services/upload/upload-orchestration-service", () => orchestrationService);

import { GET as listUploads } from "@/app/api/v1/uploads/route";
import { GET as getUpload } from "@/app/api/v1/uploads/[id]/route";
import { POST as processUpload } from "@/app/api/v1/uploads/[id]/process/route";
import { POST as approveUpload } from "@/app/api/v1/uploads/[id]/approve/route";
import { POST as rejectUpload } from "@/app/api/v1/uploads/[id]/reject/route";

const params = Promise.resolve({ id: UPLOAD_ID });

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
  uploadService.getUploadById.mockResolvedValue(mockUpload);
});

describe("GET /api/v1/uploads", () => {
  it("returns upload list on success", async () => {
    uploadService.listUploads.mockResolvedValue([mockUpload]);

    const response = await listUploads(buildRequest(orgQueryUrl("/api/v1/uploads")));
    const body = await expectSuccessEnvelope(response);
    expect(Array.isArray(body.data)).toBe(true);
    expect(uploadService.listUploads).toHaveBeenCalledWith(DEMO_ORG_ID, undefined, undefined, 50);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listUploads(buildRequest(orgQueryUrl("/api/v1/uploads")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listUploads(buildRequest("http://localhost:3000/api/v1/uploads"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/uploads/[id]", () => {
  it("returns upload status on success", async () => {
    const response = await getUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}`),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toMatchObject({
      id: UPLOAD_ID,
      status: "review_required",
      classification: "inventory",
    });
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}`),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 404 when upload does not exist", async () => {
    uploadService.getUploadById.mockResolvedValue(null);

    const response = await getUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}`),
      { params },
    );
    await expectErrorEnvelope(response, "NOT_FOUND", 404);
  });
});

describe("POST /api/v1/uploads/[id]/process", () => {
  it("processes upload on success", async () => {
    pipelineService.runUploadPipeline.mockResolvedValue({
      status: "review_required",
      confidence: 0.92,
    });

    const response = await processUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}/process`, {
        method: "POST",
      }),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toMatchObject({ status: "review_required" });
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await processUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}/process`, {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 404 when upload does not exist", async () => {
    uploadService.getUploadById.mockResolvedValue(null);

    const response = await processUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}/process`, {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "NOT_FOUND", 404);
  });
});

describe("POST /api/v1/uploads/[id]/approve", () => {
  it("approves upload on success", async () => {
    orchestrationService.finalizeUpload.mockResolvedValue({ committed: true });
    uploadService.getUploadById
      .mockResolvedValueOnce(mockUpload)
      .mockResolvedValueOnce({ ...mockUpload, processing_status: "committed" });

    const response = await approveUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}/approve`, {
        method: "POST",
        body: { entities: [] },
      }),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toMatchObject({ committed: true });
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await approveUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}/approve`, {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 404 when upload does not exist", async () => {
    uploadService.getUploadById.mockResolvedValue(null);

    const response = await approveUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}/approve`, {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "NOT_FOUND", 404);
  });
});

describe("POST /api/v1/uploads/[id]/reject", () => {
  it("rejects upload on success", async () => {
    uploadService.updateUploadStatus.mockResolvedValue(undefined);
    uploadService.getUploadById
      .mockResolvedValueOnce(mockUpload)
      .mockResolvedValueOnce({ ...mockUpload, processing_status: "rejected" });

    const response = await rejectUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}/reject`, {
        method: "POST",
        body: { reason: "Poor data quality" },
      }),
      { params },
    );
    await expectSuccessEnvelope(response);
    expect(uploadService.updateUploadStatus).toHaveBeenCalledWith(
      UPLOAD_ID,
      "rejected",
      "Poor data quality",
    );
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await rejectUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}/reject`, {
        method: "POST",
        body: { reason: "Bad file" },
      }),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when rejection reason is missing", async () => {
    const response = await rejectUpload(
      buildRequest(`http://localhost:3000/api/v1/uploads/${UPLOAD_ID}/reject`, {
        method: "POST",
        body: {},
      }),
      { params },
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});
