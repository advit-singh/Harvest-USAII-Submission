import { describe, expect, it } from "vitest";
import { buildWasteRootCause } from "@/services/analytics/root-cause";

describe("root-cause", () => {
  it("builds drivers sorted by contribution", () => {
    const result = buildWasteRootCause([
      { name: "Expiration", value: 40 },
      { name: "Overproduction", value: 30 },
      { name: "Spoilage", value: 20 },
    ]);

    expect(result.drivers[0]?.name).toBe("Expiration");
    expect(result.drivers[0]?.percent).toBeGreaterThan(result.drivers[1]?.percent ?? 0);
    expect(result.confidence).toBeGreaterThan(0.6);
    expect(result.summary).toContain("Expiration");
  });

  it("handles empty waste data", () => {
    const result = buildWasteRootCause([]);
    expect(result.drivers).toHaveLength(0);
    expect(result.summary).toContain("Insufficient");
    expect(result.confidence).toBe(0.5);
  });
});
