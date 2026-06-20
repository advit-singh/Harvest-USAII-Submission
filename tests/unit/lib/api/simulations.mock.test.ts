import { describe, expect, it } from "vitest";
import {
  compareSimulations,
  runSimulationPreview,
} from "@/lib/api/simulations";

describe("simulations mock API", () => {
  it("runs simulation preview with changes", async () => {
    const result = await runSimulationPreview("org_demo_123", {
      attendanceChange: -10,
      productionChange: -5,
      inventoryChange: 0,
      ordersChange: -10,
      weatherImpact: -15,
      eventImpact: 0,
      donationsChange: 5,
    });

    expect(result.confidence).toBeGreaterThan(0);
    expect(typeof result.costSavings).toBe("number");
  });

  it("compares two saved scenarios", async () => {
    const comparison = await compareSimulations(["sim_001", "sim_002"]);
    expect(comparison.simulations).toHaveLength(2);
    expect(comparison.winnerId).toBeTruthy();
  });
});
