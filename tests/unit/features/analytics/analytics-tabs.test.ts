import { describe, expect, it } from "vitest";
import { ANALYTICS_TABS } from "@/features/analytics/config/analytics-tabs";

describe("ANALYTICS_TABS", () => {
  it("defines exactly five tabs", () => {
    expect(ANALYTICS_TABS).toHaveLength(5);
  });

  it("has unique tab ids", () => {
    const ids = ANALYTICS_TABS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes all required analysis domains", () => {
    const ids = ANALYTICS_TABS.map((t) => t.id);
    expect(ids).toContain("waste");
    expect(ids).toContain("inventory");
    expect(ids).toContain("attendance");
    expect(ids).toContain("donations");
    expect(ids).toContain("impact");
  });
});
