import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSelectChain } from "../../../helpers/db-mock";
import { DEMO_ORG_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();
const mockForecastFindFirst = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    query: {
      forecasts: { findFirst: (...args: unknown[]) => mockForecastFindFirst(...args) },
    },
  },
}));

import { getDashboardOverview } from "@/services/analytics/analytics-service";

describe("analytics-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockImplementation(() => createSelectChain([{ count: 0 }]));
    mockForecastFindFirst.mockResolvedValue(null);
  });

  it("getDashboardOverview returns low-risk defaults without operational data", async () => {
    const overview = await getDashboardOverview(DEMO_ORG_ID);

    expect(overview.hasOperationalData).toBe(false);
    expect(overview.riskLevel).toBe("low");
    expect(overview.riskScore).toBe(35);
    expect(overview.openRecommendations).toBe(0);
    expect(overview.pendingUploads).toBe(0);
    expect(overview.forecastWindowDays).toBe(7);
    expect(overview.primaryDrivers).toEqual(["Attendance variance", "Expiration risk"]);
  });

  it("getDashboardOverview derives risk from latest forecast", async () => {
    mockSelect.mockImplementation(() => createSelectChain([{ count: 12 }]));
    mockForecastFindFirst.mockResolvedValue({
      predicted_value: "150",
      prediction_window: 14,
      explanation: "High surplus expected due to exam week attendance drop",
    });

    const overview = await getDashboardOverview(DEMO_ORG_ID);

    expect(overview.hasOperationalData).toBe(true);
    expect(overview.riskLevel).toBe("high");
    expect(overview.riskScore).toBe(75);
    expect(overview.forecastWindowDays).toBe(14);
    expect(overview.primaryDrivers[0]).toContain("High surplus");
  });
});
