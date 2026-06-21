import { describe, expect, it } from "vitest";
import { haversineKm, distanceKm } from "@/lib/geo/distance";

describe("geo distance", () => {
  it("computes haversine distance between Chicago points", () => {
    const km = haversineKm(
      { latitude: 41.8781, longitude: -87.6298 },
      { latitude: 41.8819, longitude: -87.6231 },
    );
    expect(km).toBeGreaterThan(0.5);
    expect(km).toBeLessThan(2);
  });

  it("returns fallback when coordinates missing", () => {
    expect(distanceKm(null, null, 7)).toBe(7);
  });
});
