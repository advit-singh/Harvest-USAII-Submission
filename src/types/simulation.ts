/** API_SPEC §33–35 scenario simulator */

export interface SimulationInput {
  attendanceChange: number;
  productionChange: number;
  inventoryChange: number;
  ordersChange: number;
  weatherImpact: number;
  eventImpact: number;
  donationsChange: number;
}

export interface Simulation {
  id: string;
  name: string;
  orgId: string;
  changes: SimulationInput;
  createdAt: string;
}

export interface SimulationResult {
  wasteReduction: number;
  wasteChange: number;
  costSavings: number;
  shortageRisk: number;
  environmentalImpact: number;
  confidence: number;
  predictedSurplus: number;
}

export interface SimulationComparison {
  simulations: Array<{
    id: string;
    name: string;
    result: SimulationResult;
  }>;
  winnerId: string;
}

export interface CreateSimulationInput {
  name: string;
  changes: Partial<SimulationInput>;
}
