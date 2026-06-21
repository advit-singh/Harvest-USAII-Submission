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
  DEMO_FORECAST_ID,
  DEMO_ORG_ID,
  DEMO_SITE_ID,
} from "../../helpers/service-fixtures";

const authMocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  requireOrgMembership: vi.fn(),
}));

const forecastService = vi.hoisted(() => ({
  listForecasts: vi.fn(),
  getForecastSummaryKpis: vi.fn(),
  generateForecast: vi.fn(),
  getForecastById: vi.fn(),
}));

const dbMocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  ...authMocks,
  AuthError: TestAuthError,
}));

vi.mock("@/services/forecast/forecast-service", () => forecastService);

vi.mock("@/db/client", () => ({
  db: {
    query: {
      forecasts: {
        findFirst: dbMocks.findFirst,
      },
    },
  },
}));

import { GET as listForecasts } from "@/app/api/v1/forecasts/route";
import { GET as getForecastSummary } from "@/app/api/v1/forecasts/summary/route";
import { POST as generateForecast } from "@/app/api/v1/forecasts/generate/route";
import { GET as getForecastById } from "@/app/api/v1/forecasts/[id]/route";

beforeEach(() => {
  vi.clearAllMocks();
  const auth = mockAuthSuccess();
  authMocks.requireAuthenticatedUser.mockImplementation(auth.requireAuthenticatedUser);
  authMocks.requireOrgMembership.mockImplementation(auth.requireOrgMembership);
});

describe("GET /api/v1/forecasts", () => {
  it("returns forecast list on success", async () => {
    const forecasts = [{ id: DEMO_FORECAST_ID, forecastType: "waste" }];
    forecastService.listForecasts.mockResolvedValue(forecasts);

    const response = await listForecasts(buildRequest(orgQueryUrl("/api/v1/forecasts")));
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(forecasts);
    expect(forecastService.listForecasts).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: DEMO_ORG_ID }),
    );
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await listForecasts(buildRequest(orgQueryUrl("/api/v1/forecasts")));
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await listForecasts(buildRequest("http://localhost:3000/api/v1/forecasts"));
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/forecasts/summary", () => {
  it("returns summary KPIs on success", async () => {
    const kpis = { totalForecasts: 3, avgAccuracy: 0.87 };
    forecastService.getForecastSummaryKpis.mockResolvedValue(kpis);

    const response = await getForecastSummary(
      buildRequest(orgQueryUrl("/api/v1/forecasts/summary")),
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(kpis);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getForecastSummary(
      buildRequest(orgQueryUrl("/api/v1/forecasts/summary")),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 when organizationId is missing", async () => {
    const response = await getForecastSummary(
      buildRequest("http://localhost:3000/api/v1/forecasts/summary"),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("POST /api/v1/forecasts/generate", () => {
  const validPayload = {
    organizationId: DEMO_ORG_ID,
    siteId: DEMO_SITE_ID,
    forecastType: "waste" as const,
    days: 7,
  };

  it("generates a forecast on success", async () => {
    const result = { id: DEMO_FORECAST_ID, status: "completed" };
    forecastService.generateForecast.mockResolvedValue(result);

    const response = await generateForecast(
      buildRequest("http://localhost:3000/api/v1/forecasts/generate", {
        method: "POST",
        body: validPayload,
      }),
    );
    const body = await expectSuccessEnvelope(response, 201);
    expect(body.data).toEqual(result);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await generateForecast(
      buildRequest("http://localhost:3000/api/v1/forecasts/generate", {
        method: "POST",
        body: validPayload,
      }),
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 400 for invalid payload", async () => {
    const response = await generateForecast(
      buildRequest("http://localhost:3000/api/v1/forecasts/generate", {
        method: "POST",
        body: { organizationId: DEMO_ORG_ID, forecastType: "waste" },
      }),
    );
    await expectErrorEnvelope(response, "VALIDATION_ERROR", 400);
  });
});

describe("GET /api/v1/forecasts/[id]", () => {
  const params = Promise.resolve({ id: DEMO_FORECAST_ID });

  it("returns forecast detail on success", async () => {
    dbMocks.findFirst.mockResolvedValue({
      id: DEMO_FORECAST_ID,
      organization_id: DEMO_ORG_ID,
    });
    const detail = { id: DEMO_FORECAST_ID, forecastType: "demand" };
    forecastService.getForecastById.mockResolvedValue(detail);

    const response = await getForecastById(
      buildRequest(`http://localhost:3000/api/v1/forecasts/${DEMO_FORECAST_ID}`),
      { params },
    );
    const body = await expectSuccessEnvelope(response);
    expect(body.data).toEqual(detail);
  });

  it("returns 401 when unauthorized", async () => {
    authMocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new TestAuthError("UNAUTHORIZED", "Authentication required."),
    );

    const response = await getForecastById(
      buildRequest(`http://localhost:3000/api/v1/forecasts/${DEMO_FORECAST_ID}`),
      { params },
    );
    await expectErrorEnvelope(response, "UNAUTHORIZED", 401);
  });

  it("returns 404 when forecast does not exist", async () => {
    dbMocks.findFirst.mockResolvedValue(null);

    const response = await getForecastById(
      buildRequest(`http://localhost:3000/api/v1/forecasts/${DEMO_FORECAST_ID}`),
      { params },
    );
    await expectErrorEnvelope(response, "NOT_FOUND", 404);
  });
});
