import { describe, expect, it } from "vitest";
import {
  analyticsFiltersSchema,
  analyticsTabIdSchema,
  DEFAULT_ANALYTICS_FILTERS,
} from "@/features/analytics/schemas/analytics-filters.schema";

describe("analyticsFiltersSchema", () => {
  it("accepts default filters", () => {
    const result = analyticsFiltersSchema.safeParse(DEFAULT_ANALYTICS_FILTERS);
    expect(result.success).toBe(true);
  });

  it("rejects invalid time range", () => {
    const result = analyticsFiltersSchema.safeParse({
      ...DEFAULT_ANALYTICS_FILTERS,
      timeRange: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts nullable siteId", () => {
    const result = analyticsFiltersSchema.safeParse({
      ...DEFAULT_ANALYTICS_FILTERS,
      siteId: "site_001",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.siteId).toBe("site_001");
    }
  });
});

describe("analyticsTabIdSchema", () => {
  it("accepts all five tabs", () => {
    const tabs = ["waste", "inventory", "attendance", "donations", "impact"];
    for (const tab of tabs) {
      expect(analyticsTabIdSchema.safeParse(tab).success).toBe(true);
    }
  });

  it("rejects unknown tab", () => {
    expect(analyticsTabIdSchema.safeParse("unknown").success).toBe(false);
  });
});
