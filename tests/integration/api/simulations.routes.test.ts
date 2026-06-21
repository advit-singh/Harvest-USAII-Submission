import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRequest,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  mockAuthSuccess,
  orgQueryUrl,
  TestAuthError,
} from "../../helpers/api-test-utils";
import {
  DEMO_ORG_ID,
  DEMO_SIMULATION_ID,
  DEMO_SITE_ID,
} from "../../helpers/service-fixtures";

const authMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  requireOrgMembership: vi.fn(),
}));

const simulationService = vi.hoisted(() => ({
  listSimulations: vi.fn(),
  createSimulation: vi.fn(),
  previewSimulation: vi.fn(),
  compareSimulations: vi.fn(),
  runSimulation: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/services/simulation/simulation-service", () => simulationService);

vi.mock("@/lib/api/org-context", () => ({
  getDefaultSiteForOrg: vi.fn().mockResolvedValue(DEMO_SITE_ID),
}));

vi.mock("@/db/client", () => ({
  db: {
    query: {
      simulations: {
        findFirst: dbMocks.findFirst,
      },
    },
  },
}));

import { GET as listSimulations, POST as createSimulation } from "@/app/api/v1/simulations/route";
import { POST as previewSimulation } from "@/app/api/v1/simulations/preview/route";
import { POST as compareSimulations } from "@/app/api/v1/simulations/compare/route";
import { POST as runSimulation } from "@/app/api/v1/simulations/[id]/run/route";

const simRow = { id: DEMO_SIMULATION_ID, organization_id: DEMO_ORG_ID };
const params = Promise.resolve({ id: DEMO_SIMULATION_ID });
const secondSimId = "00000000-0000-4000-8000-000000000031";

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
  dbMocks.findFirst.mockResolvedValue(simRow);
});

describe("GET /api/v1/simulations", () => {
  it("returns simulations on success", async () => {
    const simulations = [{ id: DEMO_SIMULATION_ID, name: "Baseline" }];
    simulationService.listSimulations.mockResolvedValue(simulations);

    const response = await listSimulations(buildRequest(orgQueryUrl("/api/v1/simulations")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(simulations);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listSimulations(buildRequest(orgQueryUrl("/api/v1/simulations")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listSimulations(buildRequest("http://localhost:3000/api/v1/simulations"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/simulations", () => {
  it("creates a simulation on success", async () => {
    const created = { id: DEMO_SIMULATION_ID, name: "New scenario" };
    simulationService.createSimulation.mockResolvedValue(created);

    const response = await createSimulation(
      buildRequest("http://localhost:3000/api/v1/simulations", {
        method: "POST",
        body: { organizationId: DEMO_ORG_ID, name: "New scenario" },
      }),
    );
    const body = await expectSuccessEnvelope(response, 201);
    expect(body.data).toEqual(created);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await createSimulation(
      buildRequest("http://localhost:3000/api/v1/simulations", {
        method: "POST",
        body: { organizationId: DEMO_ORG_ID, name: "New scenario" },
      }),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 for invalid create payload", async () => {
    const response = await createSimulation(
      buildRequest("http://localhost:3000/api/v1/simulations", {
        method: "POST",
        body: { organizationId: DEMO_ORG_ID },
      }),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/simulations/preview", () => {
  it("returns preview results on success", async () => {
    const preview = { projectedWaste: 12, projectedSavings: 400 };
    simulationService.previewSimulation.mockResolvedValue(preview);

    const response = await previewSimulation(
      buildRequest("http://localhost:3000/api/v1/simulations/preview", {
        method: "POST",
        body: {
          organizationId: DEMO_ORG_ID,
          siteId: DEMO_SITE_ID,
          changes: { wasteReduction: 0.1 },
        },
      }),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(preview);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await previewSimulation(
      buildRequest("http://localhost:3000/api/v1/simulations/preview", {
        method: "POST",
        body: { organizationId: DEMO_ORG_ID, siteId: DEMO_SITE_ID },
      }),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 for invalid preview payload", async () => {
    const response = await previewSimulation(
      buildRequest("http://localhost:3000/api/v1/simulations/preview", {
        method: "POST",
        body: { changes: "not-an-object" },
      }),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/simulations/compare", () => {
  it("compares simulations on success", async () => {
    const comparison = { simulations: [DEMO_SIMULATION_ID, secondSimId], winner: DEMO_SIMULATION_ID };
    simulationService.compareSimulations.mockResolvedValue(comparison);

    const response = await compareSimulations(
      buildRequest("http://localhost:3000/api/v1/simulations/compare", {
        method: "POST",
        body: {
          simulationIds: [DEMO_SIMULATION_ID, secondSimId],
          organizationId: DEMO_ORG_ID,
        },
      }),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(comparison);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await compareSimulations(
      buildRequest("http://localhost:3000/api/v1/simulations/compare", {
        method: "POST",
        body: { simulationIds: [DEMO_SIMULATION_ID, secondSimId] },
      }),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when fewer than two simulation IDs provided", async () => {
    const response = await compareSimulations(
      buildRequest("http://localhost:3000/api/v1/simulations/compare", {
        method: "POST",
        body: { simulationIds: [DEMO_SIMULATION_ID] },
      }),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/simulations/[id]/run", () => {
  it("runs simulation on success", async () => {
    const result = { id: DEMO_SIMULATION_ID, status: "completed" };
    simulationService.runSimulation.mockResolvedValue(result);

    const response = await runSimulation(
      buildRequest(`http://localhost:3000/api/v1/simulations/${DEMO_SIMULATION_ID}/run`, {
        method: "POST",
      }),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(result);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await runSimulation(
      buildRequest(`http://localhost:3000/api/v1/simulations/${DEMO_SIMULATION_ID}/run`, {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 404 when simulation does not exist", async () => {
    dbMocks.findFirst.mockResolvedValue(null);

    const response = await runSimulation(
      buildRequest(`http://localhost:3000/api/v1/simulations/${DEMO_SIMULATION_ID}/run`, {
        method: "POST",
      }),
      { params },
    );
    await expectErrorEnvelope(response, "NOT_FOUND", 404);
  });
});
