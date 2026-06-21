import { describe, expect, it } from "vitest";
import { buildWasteRootCause } from "@/services/analytics/root-cause";
import { percentOf, timeRangeToBounds } from "@/services/analytics/analytics-queries";

describe("analytics-queries", () => {
  it("calculates percent of total", () => {
    expect(percentOf(25, 100)).toBe(25);
    expect(percentOf(0, 0)).toBe(0);
  });

  it("resolves time range bounds", () => {
    const bounds = timeRangeToBounds("week");
    const diffDays =
      (bounds.end.getTime() - bounds.start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(7, 0);
  });
});

describe("root-cause", () => {
  it("returns empty analysis when no waste data", () => {
    const result = buildWasteRootCause([]);
    expect(result.drivers).toHaveLength(0);
    expect(result.summary).toContain("Insufficient");
  });

  it("identifies primary waste driver", () => {
    const result = buildWasteRootCause([
      { name: "Overproduction", value: 60 },
      { name: "Expiration", value: 40 },
    ]);
    expect(result.drivers[0]?.name).toBe("Overproduction");
    expect(result.drivers[0]?.percent).toBe(60);
    expect(result.summary).toContain("Overproduction");
  });
});
