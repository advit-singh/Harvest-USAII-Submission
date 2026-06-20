import type { SimulationInput, SimulationResult } from "@/types/simulation";
import type { OperationalSnapshot } from "@/services/intelligence/intelligence-types";
import { MEAL_COST_ESTIMATE } from "@/services/forecast/forecast-models";

export interface SimulationBaseline {
  predictedSurplus: number;
  predictedWaste: number;
  avgAttendance: number;
  inventoryUnits: number;
  purchaseSpend: number;
}

export function buildSimulationBaseline(snapshot: OperationalSnapshot): SimulationBaseline {
  const demandProxy = snapshot.avgAttendance || 300;
  const supplyProxy = snapshot.inventoryUnits / 10 + snapshot.avgWastePerDay;
  return {
    predictedSurplus: Math.max(0, supplyProxy - demandProxy * 0.15),
    predictedWaste: snapshot.avgWastePerDay * snapshot.windowDays,
    avgAttendance: snapshot.avgAttendance,
    inventoryUnits: snapshot.inventoryUnits,
    purchaseSpend: snapshot.purchaseSpend,
  };
}

export function runSimulationEngine(
  baseline: SimulationBaseline,
  changes: Partial<SimulationInput>,
): SimulationResult {
  const attendanceDelta = (changes.attendanceChange ?? 0) / 100;
  const productionDelta = (changes.productionChange ?? 0) / 100;
  const inventoryDelta = (changes.inventoryChange ?? 0) / 100;
  const ordersDelta = (changes.ordersChange ?? 0) / 100;
  const weatherDelta = (changes.weatherImpact ?? 0) / 100;
  const eventDelta = (changes.eventImpact ?? 0) / 100;
  const donationsDelta = (changes.donationsChange ?? 0) / 100;

  const demandFactor = 1 + attendanceDelta + weatherDelta + eventDelta;
  const supplyFactor = 1 + productionDelta + inventoryDelta + ordersDelta;

  const adjustedSurplus = Math.max(
    0,
    baseline.predictedSurplus * supplyFactor - baseline.avgAttendance * 0.15 * demandFactor,
  );
  const adjustedWaste = Math.max(0, baseline.predictedWaste * supplyFactor * (2 - demandFactor));
  const wasteReduction = Math.max(0, baseline.predictedWaste - adjustedWaste);
  const wasteChange = adjustedWaste - baseline.predictedWaste;
  const rescuedViaDonation = baseline.predictedWaste * donationsDelta;
  const netWasteReduction = wasteReduction + rescuedViaDonation;

  const costSavings = netWasteReduction * MEAL_COST_ESTIMATE * 0.85;
  const shortageRisk = Math.max(
    0,
    Math.min(1, (demandFactor - supplyFactor) * 0.5 + (productionDelta < -0.2 ? 0.2 : 0)),
  );
  const environmentalImpact = netWasteReduction * 2.5;

  const changeMagnitude =
    Math.abs(attendanceDelta) +
    Math.abs(productionDelta) +
    Math.abs(inventoryDelta) +
    Math.abs(ordersDelta);
  const confidence = Math.max(0.5, Math.min(0.95, 0.82 - changeMagnitude * 0.15));

  return {
    wasteReduction: Math.round(netWasteReduction),
    wasteChange: Math.round(wasteChange),
    costSavings: Math.round(costSavings),
    shortageRisk: Math.round(shortageRisk * 100) / 100,
    environmentalImpact: Math.round(environmentalImpact),
    confidence,
    predictedSurplus: Math.round(adjustedSurplus),
  };
}

export function pickSimulationWinner(
  runs: Array<{ id: string; result: SimulationResult }>,
): string {
  if (runs.length === 0) return "";
  const scored = runs.map((run) => ({
    id: run.id,
    score:
      run.result.wasteReduction * 2 +
      run.result.costSavings -
      run.result.shortageRisk * 50 +
      run.result.confidence * 10,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.id ?? runs[0].id;
}
