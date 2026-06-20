import { z } from "zod";

export const simulationInputSchema = z.object({
  name: z.string().min(1, "Scenario name is required").max(80),
  attendanceChange: z.number().min(-50).max(50),
  productionChange: z.number().min(-50).max(50),
  inventoryChange: z.number().min(-50).max(50),
  ordersChange: z.number().min(-50).max(50),
  weatherImpact: z.number().min(-50).max(50),
  eventImpact: z.number().min(-50).max(50),
  donationsChange: z.number().min(-50).max(50),
});

export type SimulationInputForm = z.infer<typeof simulationInputSchema>;

export const DEFAULT_SIMULATION_INPUT: SimulationInputForm = {
  name: "New Scenario",
  attendanceChange: 0,
  productionChange: 0,
  inventoryChange: 0,
  ordersChange: 0,
  weatherImpact: 0,
  eventImpact: 0,
  donationsChange: 0,
};
