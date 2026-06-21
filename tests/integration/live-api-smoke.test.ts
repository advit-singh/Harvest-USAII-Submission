import { describe, expect, it } from "vitest";
import { computeNextRunAt } from "@/services/report/schedule-service";
import { isMockApiEnabled, isLiveIntelligenceApiEnabled } from "@/lib/api/api-mode";
import { toSiteOptions } from "@/lib/api/sites";

describe("production integration smoke", () => {
  it("api mode helpers are defined", () => {
    expect(typeof isMockApiEnabled()).toBe("boolean");
    expect(typeof isLiveIntelligenceApiEnabled()).toBe("boolean");
  });

  it("site options include all sites entry", () => {
    const options = toSiteOptions([
      { id: "s1", organizationId: "o1", name: "Kitchen", siteType: "kitchen", isActive: true },
    ]);
    expect(options[0]?.value).toBe("all");
    expect(options[1]?.label).toBe("Kitchen");
  });

  it("schedule next run computes future date", () => {
    const next = computeNextRunAt("daily", "UTC", null, null, new Date("2026-01-01T12:00:00Z"));
    expect(next.getTime()).toBeGreaterThan(new Date("2026-01-01T12:00:00Z").getTime());
  });
});
