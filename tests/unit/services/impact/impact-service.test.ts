import { describe, expect, it } from "vitest";
import { resolveTimeRangeBounds } from "@/services/impact/impact-service";

describe("impact-service", () => {
  it("resolveTimeRangeBounds returns correct windows", () => {
    const week = resolveTimeRangeBounds("week");
    expect(week.label).toBe("Last 7 days");
    expect(week.end.getTime()).toBeGreaterThan(week.start.getTime());

    const month = resolveTimeRangeBounds("month");
    expect(month.label).toBe("Last 30 days");

    const quarter = resolveTimeRangeBounds("quarter");
    expect(quarter.label).toBe("Last 90 days");

    const year = resolveTimeRangeBounds("year");
    expect(year.label).toBe("Last 365 days");
  });
});
