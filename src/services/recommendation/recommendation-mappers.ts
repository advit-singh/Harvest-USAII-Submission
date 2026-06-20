import type { Recommendation, RecommendationDetail } from "@/types/recommendation";
import { toApiConfidence } from "@/lib/api/confidence";
import type { recommendations, recommendation_factors } from "@/db/schema";

type RecommendationRow = typeof recommendations.$inferSelect;
type FactorRow = typeof recommendation_factors.$inferSelect;

export function mapRecommendation(
  row: RecommendationRow,
  siteName: string,
): Recommendation {
  const mealsSaved = row.expected_meals_saved ?? 0;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    impact: mealsSaved > 0 ? `Save ~${mealsSaved} meals worth of waste` : "Operational improvement",
    confidence: toApiConfidence(row.confidence_score),
    priority: row.priority as Recommendation["priority"],
    status: row.status as Recommendation["status"],
    siteId: row.site_id,
    siteName,
    createdAt: row.created_at.toISOString(),
  };
}

export function mapRecommendationDetail(
  row: RecommendationRow,
  siteName: string,
  factors: FactorRow[],
  assigneeName: string | null,
): RecommendationDetail {
  const problemFactor = factors.find((f) => f.factor_name.startsWith("Problem:"));
  const evidence = factors
    .filter((f) => !f.factor_name.startsWith("Problem:") && Number(f.importance) >= 0.4)
    .map((f) => f.factor_name)
    .slice(0, 5);
  const mealsSaved = row.expected_meals_saved ?? 0;
  const savings = Number(row.expected_savings ?? 0);

  return {
    ...mapRecommendation(row, siteName),
    problem: problemFactor?.factor_name.replace(/^Problem:\s*/, "") ?? row.title,
    evidence: evidence.length > 0 ? evidence : [row.description ?? "Based on forecast analysis"],
    reasoning: row.description ?? "",
    linkedForecastId: row.forecast_id ?? null,
    expectedImpact:
      mealsSaved > 0
        ? `Prevent ${mealsSaved} meals of waste · Save ~$${Math.round(savings)}`
        : "Operational improvement",
    assigneeId: row.assignee_id ?? null,
    assigneeName,
    dueDate: row.due_date?.toISOString() ?? null,
  };
}
