import type { DraftRecommendation } from "@/services/intelligence/intelligence-types";

const PRIORITY_WEIGHT = { critical: 4, high: 3, medium: 2, low: 1 };

export function rankRecommendations(drafts: DraftRecommendation[]): DraftRecommendation[] {
  return [...drafts].sort((a, b) => score(b) - score(a));
}

export function scoreRecommendation(draft: DraftRecommendation): number {
  return score(draft);
}

function score(draft: DraftRecommendation): number {
  const priorityScore = PRIORITY_WEIGHT[draft.priority] * 25;
  const savingsScore = Math.min(draft.expectedSavings / 10, 30);
  const mealsScore = Math.min(draft.expectedMealsSaved, 25);
  const confidenceScore = draft.confidence * 20;
  return priorityScore + savingsScore + mealsScore + confidenceScore;
}
