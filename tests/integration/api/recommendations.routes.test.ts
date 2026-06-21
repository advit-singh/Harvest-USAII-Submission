import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRequest,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  mockAuthSuccess,
  orgQueryUrl,
  TestAuthError,
} from "../../helpers/api-test-utils";
import { DEMO_ORG_ID, DEMO_REC_ID, DEMO_USER_ID } from "../../helpers/service-fixtures";

const authMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  requireOrgMembership: vi.fn(),
}));

const recommendationService = vi.hoisted(() => ({
  listRecommendations: vi.fn(),
  getRecommendationById: vi.fn(),
  submitRecommendationAction: vi.fn(),
  assignRecommendation: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/services/recommendation/recommendation-service", () => recommendationService);

vi.mock("@/db/client", () => ({
  db: {
    query: {
      recommendations: {
        findFirst: dbMocks.findFirst,
      },
    },
  },
}));

import { GET as listRecommendations } from "@/app/api/v1/recommendations/route";
import { GET as getRecommendation } from "@/app/api/v1/recommendations/[id]/route";
import { POST as submitAction } from "@/app/api/v1/recommendations/[id]/action/route";
import { POST as assignRecommendation } from "@/app/api/v1/recommendations/[id]/assign/route";

const recRow = { id: DEMO_REC_ID, organization_id: DEMO_ORG_ID };
const params = Promise.resolve({ id: DEMO_REC_ID });

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
  dbMocks.findFirst.mockResolvedValue(recRow);
});

describe("GET /api/v1/recommendations", () => {
  it("returns recommendations on success", async () => {
    const items = [{ id: DEMO_REC_ID, title: "Reduce waste" }];
    recommendationService.listRecommendations.mockResolvedValue(items);

    const response = await listRecommendations(
      buildRequest(orgQueryUrl("/api/v1/recommendations")),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(items);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listRecommendations(
      buildRequest(orgQueryUrl("/api/v1/recommendations")),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listRecommendations(
      buildRequest("http://localhost:3000/api/v1/recommendations"),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/recommendations/[id]", () => {
  it("returns recommendation detail on success", async () => {
    const detail = { id: DEMO_REC_ID, status: "open" };
    recommendationService.getRecommendationById.mockResolvedValue(detail);

    const response = await getRecommendation(
      buildRequest(`http://localhost:3000/api/v1/recommendations/${DEMO_REC_ID}`),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(detail);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getRecommendation(
      buildRequest(`http://localhost:3000/api/v1/recommendations/${DEMO_REC_ID}`),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 404 when recommendation does not exist", async () => {
    dbMocks.findFirst.mockResolvedValue(null);

    const response = await getRecommendation(
      buildRequest(`http://localhost:3000/api/v1/recommendations/${DEMO_REC_ID}`),
      { params },
    );
    await expectErrorEnvelope(response, "NOT_FOUND", 404);
  });
});

describe("POST /api/v1/recommendations/[id]/action", () => {
  it("submits action on success", async () => {
    const updated = { id: DEMO_REC_ID, status: "accepted" };
    recommendationService.submitRecommendationAction.mockResolvedValue(updated);

    const response = await submitAction(
      buildRequest(`http://localhost:3000/api/v1/recommendations/${DEMO_REC_ID}/action`, {
        method: "POST",
        body: { action: "accepted", notes: "Looks good" },
      }),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(updated);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await submitAction(
      buildRequest(`http://localhost:3000/api/v1/recommendations/${DEMO_REC_ID}/action`, {
        method: "POST",
        body: { action: "accepted" },
      }),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 for invalid action payload", async () => {
    const response = await submitAction(
      buildRequest(`http://localhost:3000/api/v1/recommendations/${DEMO_REC_ID}/action`, {
        method: "POST",
        body: { action: "invalid" },
      }),
      { params },
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/recommendations/[id]/assign", () => {
  it("assigns recommendation on success", async () => {
    const updated = { id: DEMO_REC_ID, assigneeId: DEMO_USER_ID };
    recommendationService.assignRecommendation.mockResolvedValue(updated);

    const response = await assignRecommendation(
      buildRequest(`http://localhost:3000/api/v1/recommendations/${DEMO_REC_ID}/assign`, {
        method: "POST",
        body: { assigneeId: DEMO_USER_ID },
      }),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(updated);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await assignRecommendation(
      buildRequest(`http://localhost:3000/api/v1/recommendations/${DEMO_REC_ID}/assign`, {
        method: "POST",
        body: { assigneeId: DEMO_USER_ID },
      }),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 for invalid assignment payload", async () => {
    const response = await assignRecommendation(
      buildRequest(`http://localhost:3000/api/v1/recommendations/${DEMO_REC_ID}/assign`, {
        method: "POST",
        body: { assigneeId: "not-a-uuid" },
      }),
      { params },
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});
