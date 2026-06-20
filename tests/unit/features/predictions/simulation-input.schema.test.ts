import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIMULATION_INPUT,
  simulationInputSchema,
} from "@/features/predictions/schemas/simulation-input.schema";

describe("simulationInputSchema", () => {
  it("accepts default simulation input", () => {
    const result = simulationInputSchema.safeParse(DEFAULT_SIMULATION_INPUT);
    expect(result.success).toBe(true);
  });

  it("rejects empty scenario name", () => {
    const result = simulationInputSchema.safeParse({
      ...DEFAULT_SIMULATION_INPUT,
      name: "",
    });
    expect(result.success).toBe(false);
  });
});
