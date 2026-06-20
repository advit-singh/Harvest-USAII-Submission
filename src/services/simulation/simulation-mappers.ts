import type { Simulation, SimulationComparison, SimulationResult } from "@/types/simulation";
import type { simulation_runs, simulations } from "@/db/schema";
import type { SimulationInput } from "@/types/simulation";

type SimulationRow = typeof simulations.$inferSelect;
type RunRow = typeof simulation_runs.$inferSelect;

const DEFAULT_INPUT: SimulationInput = {
  attendanceChange: 0,
  productionChange: 0,
  inventoryChange: 0,
  ordersChange: 0,
  weatherImpact: 0,
  eventImpact: 0,
  donationsChange: 0,
};

export function mapSimulation(row: SimulationRow, changes?: Partial<SimulationInput>): Simulation {
  return {
    id: row.id,
    name: row.name,
    orgId: row.organization_id,
    changes: { ...DEFAULT_INPUT, ...changes },
    createdAt: row.created_at.toISOString(),
  };
}

export function mapSimulationResult(output: SimulationResult): SimulationResult {
  return output;
}

export function parseRunInput(parameters: unknown): Partial<SimulationInput> {
  if (!parameters || typeof parameters !== "object") return {};
  return parameters as Partial<SimulationInput>;
}

export function parseRunOutput(results: unknown): SimulationResult | null {
  if (!results || typeof results !== "object") return null;
  return results as SimulationResult;
}

export function mapSimulationComparison(
  items: Array<{ id: string; name: string; result: SimulationResult }>,
  winnerId: string,
): SimulationComparison {
  return { simulations: items, winnerId };
}

export function getLatestRunOutput(runs: RunRow[]): SimulationResult | null {
  const latest = runs[runs.length - 1];
  if (!latest?.output_results) return null;
  return parseRunOutput(latest.output_results);
}
