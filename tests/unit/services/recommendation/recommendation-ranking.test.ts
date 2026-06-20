import { describe, expect, it } from "vitest";
import { rankRecommendations, scoreRecommendation } from "@/services/recommendation/recommendation-ranking";
import type { DraftRecommendation } from "@/services/intelligence/intelligence-types";

const baseDraft = (overrides: Partial<DraftRecommendation> = {}): DraftRecommendation => ({
  recommendationType: "production",
  title: "Test",
  description: "Test",
  problem: "Test problem",
  evidence: ["evidence"],
  reasoning: "reasoning",
  priority: "medium",
  confidence: 0.8,
  expectedSavings: 100,
  expectedMealsSaved: 20,
  expectedImpact: "impact",
  factors: [],
  ...overrides,
});

describe("recommendation-ranking", () => {
  it("ranks critical higher priority recommendations first", () => {
    const ranked = rankRecommendations([
      baseDraft({ priority: "low", expectedSavings: 500 }),
      baseDraft({ priority: "critical", expectedSavings: 50 }),
    ]);

    expect(ranked[0].priority).toBe("critical");
  });

  it("scores higher savings and confidence higher", () => {
    const low = scoreRecommendation(baseDraft({ expectedSavings: 10, confidence: 0.5 }));
    const high = scoreRecommendation(baseDraft({ expectedSavings: 500, confidence: 0.95, priority: "high" }));
    expect(high).toBeGreaterThan(low);
  });
});
