import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { simulation_runs, simulations } from "@/db/schema";
import type { CreateSimulationInput, SimulationInput, SimulationResult } from "@/types/simulation";
import { loadOperationalSnapshot } from "@/services/intelligence/operational-data-loader";
import {
  buildSimulationBaseline,
  pickSimulationWinner,
  runSimulationEngine,
} from "@/services/simulation/simulation-engine";
import {
  mapSimulation,
  mapSimulationComparison,
  parseRunInput,
  parseRunOutput,
} from "@/services/simulation/simulation-mappers";
import { toDbConfidence } from "@/lib/api/confidence";

export async function listSimulations(organizationId: string) {
  const rows = await db
    .select()
    .from(simulations)
    .where(eq(simulations.organization_id, organizationId))
    .orderBy(desc(simulations.created_at))
    .limit(50);

  const results = await Promise.all(
    rows.map(async (row) => {
      const runs = await db
        .select()
        .from(simulation_runs)
        .where(eq(simulation_runs.simulation_id, row.id))
        .orderBy(desc(simulation_runs.created_at))
        .limit(1);
      const input = runs[0] ? parseRunInput(runs[0].input_parameters) : {};
      return mapSimulation(row, input);
    }),
  );

  return results;
}

export async function createSimulation(
  organizationId: string,
  userId: string,
  input: CreateSimulationInput,
) {
  const [row] = await db
    .insert(simulations)
    .values({
      organization_id: organizationId,
      created_by: userId,
      name: input.name,
      description: `Scenario: ${input.name}`,
    })
    .returning();

  await db.insert(simulation_runs).values({
    simulation_id: row.id,
    input_parameters: input.changes,
    created_by: userId,
  });

  return mapSimulation(row, input.changes);
}

export async function runSimulation(
  simulationId: string,
  organizationId: string,
  siteId: string,
  userId?: string,
): Promise<SimulationResult | null> {
  const row = await db.query.simulations.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, simulationId), eqFn(fields.organization_id, organizationId)),
  });

  if (!row) return null;

  const runs = await db
    .select()
    .from(simulation_runs)
    .where(eq(simulation_runs.simulation_id, simulationId))
    .orderBy(desc(simulation_runs.created_at))
    .limit(1);

  const changes = runs[0] ? parseRunInput(runs[0].input_parameters) : {};
  const result = await computeSimulationResult(organizationId, siteId, changes);

  await db.insert(simulation_runs).values({
    simulation_id: simulationId,
    input_parameters: changes,
    output_results: result,
    confidence_score: toDbConfidence(result.confidence),
    created_by: userId,
  });

  return result;
}

export async function previewSimulation(
  organizationId: string,
  siteId: string,
  changes: Partial<SimulationInput>,
): Promise<SimulationResult> {
  return computeSimulationResult(organizationId, siteId, changes);
}

export async function compareSimulations(simulationIds: string[], organizationId: string) {
  if (simulationIds.length < 2) {
    throw new Error("Need at least two simulations to compare.");
  }

  const items = await Promise.all(
    simulationIds.map(async (id) => {
      const row = await db.query.simulations.findFirst({
        where: (fields, { and: andFn, eq: eqFn }) =>
          andFn(eqFn(fields.id, id), eqFn(fields.organization_id, organizationId)),
      });
      if (!row) return null;

      const runs = await db
        .select()
        .from(simulation_runs)
        .where(eq(simulation_runs.simulation_id, id))
        .orderBy(desc(simulation_runs.created_at))
        .limit(1);

      const output = runs[0] ? parseRunOutput(runs[0].output_results) : null;
      if (!output) return null;

      return { id: row.id, name: row.name, result: output };
    }),
  );

  const valid = items.filter((item): item is NonNullable<typeof item> => item !== null);
  if (valid.length < 2) {
    throw new Error("Need at least two simulations with run results to compare.");
  }

  const winnerId = pickSimulationWinner(valid);
  return mapSimulationComparison(valid, winnerId);
}

async function computeSimulationResult(
  organizationId: string,
  siteId: string,
  changes: Partial<SimulationInput>,
): Promise<SimulationResult> {
  const snapshot = await loadOperationalSnapshot({ organizationId, siteId, windowDays: 7 });
  const baseline = buildSimulationBaseline(snapshot);
  return runSimulationEngine(baseline, changes);
}
