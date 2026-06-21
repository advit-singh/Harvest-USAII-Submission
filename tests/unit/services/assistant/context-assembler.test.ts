import { describe, expect, it } from "vitest";
import { assembleAssistantContext } from "@/services/assistant/context-assembler";
import type { RetrievalBundle } from "@/services/assistant/assistant-types";

const bundle: RetrievalBundle = {
  wasteSummary: "Risk medium (45). Waste total 120 kg.",
  inventorySummary: "Turnover 0.8",
  attendanceSummary: "Forecast accuracy 82%",
  forecastSummary: "surplus: 47 meals",
  recommendationSummary: "Reduce production — high priority",
  donationSummary: "Meals rescued 38",
  impactSummary: "Meals saved: 38",
  citations: [
    {
      id: "cite_waste",
      sourceType: "waste",
      title: "Waste analytics",
      excerpt: "Weekly waste trend",
      href: "/analytics?tab=waste",
    },
  ],
};

describe("context-assembler", () => {
  it("assembles prompt context with citations", () => {
    const result = assembleAssistantContext(bundle);
    expect(result.promptContext).toContain("WASTE:");
    expect(result.promptContext).toContain("FORECASTS:");
    expect(result.citations).toHaveLength(1);
  });

  it("truncates oversized context", () => {
    const largeBundle: RetrievalBundle = {
      ...bundle,
      wasteSummary: "x".repeat(7000),
    };
    const result = assembleAssistantContext(largeBundle);
    expect(result.promptContext.length).toBeLessThanOrEqual(6020);
    expect(result.promptContext).toContain("[context truncated]");
  });
});
