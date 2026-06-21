import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRequest,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  mockAuthSuccess,
  orgQueryUrl,
  TestAuthError,
} from "../../helpers/api-test-utils";
import { DEMO_OPPORTUNITY_ID, DEMO_ORG_ID, DEMO_USER_ID } from "../../helpers/service-fixtures";

const authMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  requireOrgMembership: vi.fn(),
}));

const donationService = vi.hoisted(() => ({
  listDonationHistory: vi.fn(),
  listDonationOpportunities: vi.fn(),
  getDonationOpportunityById: vi.fn(),
  matchDonationOpportunity: vi.fn(),
  dismissDonationOpportunity: vi.fn(),
  completeDonation: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/services/donation/donation-service", () => donationService);

import { GET as listDonations } from "@/app/api/v1/donations/route";
import { GET as listOpportunities } from "@/app/api/v1/donations/opportunities/route";
import { GET as getOpportunity } from "@/app/api/v1/donations/opportunities/[id]/route";
import { POST as matchOpportunity } from "@/app/api/v1/donations/opportunities/[id]/match/route";
import { POST as dismissOpportunity } from "@/app/api/v1/donations/opportunities/[id]/dismiss/route";
import { POST as completeDonation } from "@/app/api/v1/donations/[id]/complete/route";

const params = Promise.resolve({ id: DEMO_OPPORTUNITY_ID });
const recipientId = "00000000-0000-4000-8000-000000000040";

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
});

describe("GET /api/v1/donations", () => {
  it("returns donation history on success", async () => {
    const history = [{ id: "don-1", status: "completed" }];
    donationService.listDonationHistory.mockResolvedValue(history);

    const response = await listDonations(buildRequest(orgQueryUrl("/api/v1/donations")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(history);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listDonations(buildRequest(orgQueryUrl("/api/v1/donations")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listDonations(buildRequest("http://localhost:3000/api/v1/donations"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/donations/opportunities", () => {
  it("returns open opportunities on success", async () => {
    const opportunities = [{ id: DEMO_OPPORTUNITY_ID, status: "open" }];
    donationService.listDonationOpportunities.mockResolvedValue(opportunities);

    const response = await listOpportunities(
      buildRequest(orgQueryUrl("/api/v1/donations/opportunities")),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(opportunities);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listOpportunities(
      buildRequest(orgQueryUrl("/api/v1/donations/opportunities")),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listOpportunities(
      buildRequest("http://localhost:3000/api/v1/donations/opportunities"),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/donations/opportunities/[id]", () => {
  it("returns opportunity detail on success", async () => {
    const opportunity = { id: DEMO_OPPORTUNITY_ID, itemCount: 5 };
    donationService.getDonationOpportunityById.mockResolvedValue(opportunity);

    const response = await getOpportunity(
      buildRequest(orgQueryUrl(`/api/v1/donations/opportunities/${DEMO_OPPORTUNITY_ID}`)),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(opportunity);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getOpportunity(
      buildRequest(orgQueryUrl(`/api/v1/donations/opportunities/${DEMO_OPPORTUNITY_ID}`)),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await getOpportunity(
      buildRequest(`http://localhost:3000/api/v1/donations/opportunities/${DEMO_OPPORTUNITY_ID}`),
      { params },
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/donations/opportunities/[id]/match", () => {
  it("matches opportunity on success", async () => {
    const matched = { id: DEMO_OPPORTUNITY_ID, status: "matched" };
    donationService.matchDonationOpportunity.mockResolvedValue(matched);

    const response = await matchOpportunity(
      buildRequest(orgQueryUrl(`/api/v1/donations/opportunities/${DEMO_OPPORTUNITY_ID}/match`), {
        method: "POST",
      }),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(matched);
    expect(donationService.matchDonationOpportunity).toHaveBeenCalledWith(
      DEMO_OPPORTUNITY_ID,
      DEMO_ORG_ID,
      DEMO_USER_ID,
    );
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await matchOpportunity(
      buildRequest(orgQueryUrl(`/api/v1/donations/opportunities/${DEMO_OPPORTUNITY_ID}/match`), {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await matchOpportunity(
      buildRequest(`http://localhost:3000/api/v1/donations/opportunities/${DEMO_OPPORTUNITY_ID}/match`, {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/donations/opportunities/[id]/dismiss", () => {
  it("dismisses opportunity on success", async () => {
    const dismissed = { id: DEMO_OPPORTUNITY_ID, status: "dismissed" };
    donationService.dismissDonationOpportunity.mockResolvedValue(dismissed);

    const response = await dismissOpportunity(
      buildRequest(orgQueryUrl(`/api/v1/donations/opportunities/${DEMO_OPPORTUNITY_ID}/dismiss`), {
        method: "POST",
        body: { reason: "No capacity" },
      }),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(dismissed);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await dismissOpportunity(
      buildRequest(orgQueryUrl(`/api/v1/donations/opportunities/${DEMO_OPPORTUNITY_ID}/dismiss`), {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await dismissOpportunity(
      buildRequest(`http://localhost:3000/api/v1/donations/opportunities/${DEMO_OPPORTUNITY_ID}/dismiss`, {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/donations/[id]/complete", () => {
  it("completes donation on success", async () => {
    const completed = { id: DEMO_OPPORTUNITY_ID, status: "completed" };
    donationService.completeDonation.mockResolvedValue(completed);

    const response = await completeDonation(
      buildRequest(orgQueryUrl(`/api/v1/donations/${DEMO_OPPORTUNITY_ID}/complete`), {
        method: "POST",
        body: { recipientId, quantity: 10 },
      }),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(completed);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await completeDonation(
      buildRequest(orgQueryUrl(`/api/v1/donations/${DEMO_OPPORTUNITY_ID}/complete`), {
        method: "POST",
        body: { recipientId },
      }),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when recipientId is missing", async () => {
    const response = await completeDonation(
      buildRequest(orgQueryUrl(`/api/v1/donations/${DEMO_OPPORTUNITY_ID}/complete`), {
        method: "POST",
        body: {},
      }),
      { params },
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});
