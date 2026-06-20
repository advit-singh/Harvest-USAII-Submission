import { describe, expect, it } from "vitest";
import { fetchWasteAnalytics } from "@/lib/api/analytics-waste";
import { DEFAULT_ANALYTICS_FILTERS } from "@/features/analytics/schemas/analytics-filters.schema";
import { toAnalyticsFilters } from "@/features/analytics/config/analytics-tabs";

describe("analytics-waste mock API", () => {
  it("returns waste analytics for demo org", async () => {
    const filters = toAnalyticsFilters(DEFAULT_ANALYTICS_FILTERS);
    const data = await fetchWasteAnalytics("org_demo_123", filters);

    expect(data.timeSeries.length).toBeGreaterThan(0);
    expect(data.byCategory.length).toBeGreaterThan(0);
    expect(data.rootCause.drivers.length).toBeGreaterThan(0);

    const totalPercent = data.rootCause.drivers.reduce(
      (sum, d) => sum + d.percent,
      0,
    );
    expect(totalPercent).toBe(100);
  });

  it("returns empty data for empty org", async () => {
    const filters = toAnalyticsFilters(DEFAULT_ANALYTICS_FILTERS);
    const data = await fetchWasteAnalytics("org_empty_test", filters);

    expect(data.timeSeries).toHaveLength(0);
    expect(data.rootCause.drivers).toHaveLength(0);
  });
});
