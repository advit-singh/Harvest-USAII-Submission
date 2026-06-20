import { apiClient } from "@/lib/api/client";
import { isLiveIntelligenceApiEnabled } from "@/lib/api/api-mode";
import {
  resolveIntelligenceOrgId,
  resolveIntelligenceSiteId,
} from "@/lib/api/intelligence-org-bridge";
import {
  compareMockSimulations,
  createMockSimulation,
  getMockSimulations,
  runMockSimulation,
  runMockSimulationWithChanges,
} from "@/lib/mocks/predictions-fixtures";
import type {
  CreateSimulationInput,
  Simulation,
  SimulationComparison,
  SimulationInput,
  SimulationResult,
} from "@/types/simulation";

export async function fetchSimulations(orgId: string): Promise<Simulation[]> {
  if (!isLiveIntelligenceApiEnabled()) {
    await new Promise((r) => setTimeout(r, 200));
    return getMockSimulations(orgId);
  }

  return apiClient<Simulation[]>(
    `/simulations?organizationId=${resolveIntelligenceOrgId(orgId)}`,
  );
}

export async function createSimulation(
  orgId: string,
  input: CreateSimulationInput,
): Promise<Simulation> {
  if (!isLiveIntelligenceApiEnabled()) {
    await new Promise((r) => setTimeout(r, 300));
    return createMockSimulation(orgId, input.name, input.changes);
  }

  return apiClient<Simulation>("/simulations", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      organizationId: resolveIntelligenceOrgId(orgId),
    }),
  });
}

export async function runSimulation(id: string): Promise<SimulationResult> {
  if (!isLiveIntelligenceApiEnabled()) {
    await new Promise((r) => setTimeout(r, 600));
    const result = runMockSimulation(id);
    if (!result) {
      throw new Error("Simulation not found");
    }
    return result;
  }

  return apiClient<SimulationResult>(`/simulations/${id}/run`, {
    method: "POST",
  });
}

export async function runSimulationPreview(
  orgId: string,
  changes: SimulationInput,
): Promise<SimulationResult> {
  if (!isLiveIntelligenceApiEnabled()) {
    await new Promise((r) => setTimeout(r, 400));
    return runMockSimulationWithChanges(changes);
  }

  return apiClient<SimulationResult>("/simulations/preview", {
    method: "POST",
    body: JSON.stringify({
      organizationId: resolveIntelligenceOrgId(orgId),
      siteId: resolveIntelligenceSiteId(null),
      changes,
    }),
  });
}

export async function compareSimulations(
  simulationIds: string[],
): Promise<SimulationComparison> {
  if (!isLiveIntelligenceApiEnabled()) {
    await new Promise((r) => setTimeout(r, 350));
    const comparison = compareMockSimulations(simulationIds);
    if (!comparison) {
      throw new Error("Need at least two simulations to compare");
    }
    return comparison;
  }

  return apiClient<SimulationComparison>("/simulations/compare", {
    method: "POST",
    body: JSON.stringify({ simulationIds }),
  });
}
