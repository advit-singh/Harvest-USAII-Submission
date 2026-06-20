import { describe, expect, it } from "vitest";
import {
  buildSimulationBaseline,
  pickSimulationWinner,
  runSimulationEngine,
} from "@/services/simulation/simulation-engine";
import type { OperationalSnapshot } from "@/services/intelligence/intelligence-types";

const snapshot: OperationalSnapshot = {
  organizationId: "org-1",
  siteId: "site-1",
  windowDays: 7,
  wasteMeals: [4, 5, 6],
  attendance: [300, 310, 290],
  expirationRiskItems: 3,
  upcomingEvents: [],
  inventoryUnits: 100,
  purchaseSpend: 1500,
  avgWastePerDay: 5,
  avgAttendance: 300,
  wasteTrend: 10,
  attendanceTrend: -5,
};

describe("simulation-engine", () => {
  it("reduces waste when production is lowered", () => {
    const baseline = buildSimulationBaseline(snapshot);
    const result = runSimulationEngine(baseline, { productionChange: -15, ordersChange: -15 });

    expect(result.wasteReduction).toBeGreaterThan(0);
    expect(result.costSavings).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("increases shortage risk when production cut too aggressively with rising demand", () => {
    const baseline = buildSimulationBaseline(snapshot);
    const result = runSimulationEngine(baseline, {
      productionChange: -30,
      attendanceChange: 20,
    });

    expect(result.shortageRisk).toBeGreaterThan(0);
  });

  it("picks winner by composite score", () => {
    const winner = pickSimulationWinner([
      { id: "a", result: { wasteReduction: 5, costSavings: 10, shortageRisk: 0.5, wasteChange: -5, environmentalImpact: 10, confidence: 0.7, predictedSurplus: 50 } },
      { id: "b", result: { wasteReduction: 30, costSavings: 200, shortageRisk: 0.1, wasteChange: -30, environmentalImpact: 60, confidence: 0.9, predictedSurplus: 20 } },
    ]);

    expect(winner).toBe("b");
  });
});
