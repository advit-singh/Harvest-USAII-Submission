import { describe, expect, it } from "vitest";
import { computeNextRunAt } from "@/services/report/schedule-service";

describe("computeNextRunAt", () => {
  it("computes next daily run", () => {
    const from = new Date("2026-06-01T10:00:00Z");
    const next = computeNextRunAt("daily", "UTC", null, null, from);
    expect(next.getDate()).toBe(2);
    expect(next.getHours()).toBe(8);
  });

  it("computes next weekly run", () => {
    const from = new Date("2026-06-01T10:00:00Z"); // Monday
    const next = computeNextRunAt("weekly", "UTC", 1, null, from);
    expect(next.getDay()).toBe(1);
    expect(next > from).toBe(true);
  });

  it("computes next monthly run", () => {
    const from = new Date("2026-06-15T10:00:00Z");
    const next = computeNextRunAt("monthly", "UTC", null, 1, from);
    expect(next.getMonth()).toBe(6); // July (0-indexed)
    expect(next.getDate()).toBe(1);
  });
});
