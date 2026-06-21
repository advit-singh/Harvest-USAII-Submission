import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSelectChain } from "../../../helpers/db-mock";
import { DEMO_ORG_ID } from "../../../helpers/service-fixtures";

const mockSelect = vi.fn();

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

import { listForecasts } from "@/services/forecast/forecast-service";

describe("forecast-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockImplementation(() => createSelectChain([]));
  });

  it("listForecasts returns empty array when no forecasts exist", async () => {
    const results = await listForecasts({ organizationId: DEMO_ORG_ID });
    expect(results).toEqual([]);
    expect(mockSelect).toHaveBeenCalled();
  });

  it("listForecasts accepts optional filters without error", async () => {
    const results = await listForecasts({
      organizationId: DEMO_ORG_ID,
      forecastType: "waste",
      siteId: "site-1",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });
    expect(results).toEqual([]);
  });
});
