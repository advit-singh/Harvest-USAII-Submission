import { describe, expect, it } from "vitest";
import { PREDICTIONS_TABS } from "@/features/predictions/config/predictions-tabs";

describe("PREDICTIONS_TABS", () => {
  it("defines four workspace tabs", () => {
    expect(PREDICTIONS_TABS).toHaveLength(4);
    expect(PREDICTIONS_TABS.map((t) => t.id)).toEqual([
      "summary",
      "explorer",
      "recommendations",
      "simulator",
    ]);
  });
});
