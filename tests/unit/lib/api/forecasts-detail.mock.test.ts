import { describe, expect, it } from "vitest";
import { fetchForecastById } from "@/lib/api/forecasts";
import { getMockForecastDetail } from "@/lib/mocks/predictions-fixtures";

describe("forecasts detail mock API", () => {
  it("returns forecast detail with factors", async () => {
    const detail = await fetchForecastById("fcst_001");
    expect(detail.id).toBe("fcst_001");
    expect(detail.factors.length).toBeGreaterThan(0);
  });

  it("fixture matches fetchForecastById", () => {
    const fixture = getMockForecastDetail("fcst_001");
    expect(fixture?.factors[0]?.name).toBe("Rain Forecast");
  });
});
