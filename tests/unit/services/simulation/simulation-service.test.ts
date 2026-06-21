import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildOperationalSnapshot, DEMO_ORG_ID, DEMO_SITE_ID } from "../../../helpers/service-fixtures";

vi.mock("@/services/intelligence/operational-data-loader", () => ({
  loadOperationalSnapshot: vi.fn(),
}));

import { loadOperationalSnapshot } from "@/services/intelligence/operational-data-loader";
import { previewSimulation, compareSimulations } from "@/services/simulation/simulation-service";

describe("simulation-service", () => {
  beforeEach(() => {
    vi.mocked(loadOperationalSnapshot).mockResolvedValue(buildOperationalSnapshot());
  });

  it("previewSimulation returns simulation result from baseline", async () => {
    const result = await previewSimulation(DEMO_ORG_ID, DEMO_SITE_ID, {
      attendanceChange: -10,
    });
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.wasteChange).toBeDefined();
    expect(result.costSavings).toBeDefined();
  });

  it("compareSimulations throws when fewer than two ids", async () => {
    await expect(compareSimulations(["sim-1"], DEMO_ORG_ID)).rejects.toThrow(
      "Need at least two simulations",
    );
  });
});
