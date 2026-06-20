import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { recommendation_factors, recommendations } from "@/db/schema";
import type {
  DraftRecommendation,
  ForecastComputation,
  OperationalSnapshot,
} from "@/services/intelligence/intelligence-types";
import { MEAL_COST_ESTIMATE } from "@/services/forecast/forecast-models";
import { rankRecommendations } from "@/services/recommendation/recommendation-ranking";
import { toDbConfidence } from "@/lib/api/confidence";

export interface GenerateRecommendationsInput {
  forecastId: string;
  organizationId: string;
  siteId: string;
  computation: ForecastComputation;
  snapshot: OperationalSnapshot;
  createdBy?: string;
}

export async function generateRecommendationsFromForecast(input: GenerateRecommendationsInput) {
  const drafts = detectRecommendations(input.computation, input.snapshot);
  const ranked = rankRecommendations(drafts).slice(0, 8);

  for (const draft of ranked) {
    const [rec] = await db
      .insert(recommendations)
      .values({
        organization_id: input.organizationId,
        site_id: input.siteId,
        forecast_id: input.forecastId,
        recommendation_type: draft.recommendationType,
        title: draft.title,
        description: draft.reasoning,
        priority: draft.priority,
        confidence_score: toDbConfidence(draft.confidence),
        expected_savings: String(draft.expectedSavings),
        expected_meals_saved: draft.expectedMealsSaved,
        status: "open",
        created_by: input.createdBy,
      })
      .returning();

    const factors = [
      { factor_name: `Problem: ${draft.problem}`, importance: "1" },
      ...draft.evidence.map((evidence, index) => ({
        factor_name: evidence.slice(0, 255),
        importance: String(Math.max(0.5 - index * 0.05, 0.1)),
      })),
      ...draft.factors.map((factor) => ({
        factor_name: factor.name,
        importance: String(factor.importance),
      })),
    ];

    if (factors.length > 0) {
      await db.insert(recommendation_factors).values(
        factors.map((factor) => ({
          recommendation_id: rec.id,
          factor_name: factor.factor_name,
          importance: factor.importance,
          created_by: input.createdBy,
        })),
      );
    }
  }
}

export function detectRecommendations(
  computation: ForecastComputation,
  snapshot: OperationalSnapshot,
): DraftRecommendation[] {
  const drafts: DraftRecommendation[] = [];

  if (computation.predictedSurplusMeals > 20) {
    const reduction = Math.min(20, Math.round(computation.predictedSurplusMeals * 0.15));
    const mealsSaved = Math.round(computation.predictedSurplusMeals * 0.3);
    drafts.push({
      recommendationType: "production",
      title: `Reduce production by ${reduction}%`,
      description: "Align production with projected lower demand",
      problem: `Projected surplus of ${computation.predictedSurplusMeals} meals exceeds safe buffer`,
      evidence: [
        `Attendance trend: ${snapshot.attendanceTrend.toFixed(0)}%`,
        `Avg attendance: ${snapshot.avgAttendance.toFixed(0)}`,
        `${snapshot.upcomingEvents.length} upcoming events may shift demand`,
      ],
      reasoning:
        "Historical attendance patterns and current inventory levels suggest overproduction risk. A modest production reduction preserves quality while preventing waste.",
      priority: computation.predictedSurplusMeals > 50 ? "high" : "medium",
      confidence: computation.confidence,
      expectedSavings: mealsSaved * MEAL_COST_ESTIMATE,
      expectedMealsSaved: mealsSaved,
      expectedImpact: `Prevent ${mealsSaved} meals of waste · Save ~$${Math.round(mealsSaved * MEAL_COST_ESTIMATE)}`,
      factors: [{ name: "Surplus Forecast", importance: 0.9 }],
    });
  }

  if (snapshot.expirationRiskItems > 3) {
    const mealsSaved = snapshot.expirationRiskItems * 3;
    drafts.push({
      recommendationType: "inventory",
      title: "Prioritize expiring inventory in menu planning",
      description: "Use items nearing expiration before ordering replacements",
      problem: `${snapshot.expirationRiskItems} inventory lots expire within the forecast window`,
      evidence: [
        `${snapshot.expirationRiskItems} lots at expiration risk`,
        `Inventory units on hand: ${snapshot.inventoryUnits.toFixed(0)}`,
      ],
      reasoning:
        "Redirecting expiring inventory into planned menus reduces spoilage without additional purchasing.",
      priority: snapshot.expirationRiskItems > 8 ? "critical" : "high",
      confidence: Math.min(computation.confidence + 0.05, 0.95),
      expectedSavings: mealsSaved * MEAL_COST_ESTIMATE * 0.8,
      expectedMealsSaved: mealsSaved,
      expectedImpact: `Rescue ${mealsSaved} meal-equivalents · Save ~$${Math.round(mealsSaved * MEAL_COST_ESTIMATE * 0.8)}`,
      factors: [{ name: "Expiration Risk", importance: 0.85 }],
    });
  }

  if (computation.predictedWasteMeals > 15) {
    const mealsSaved = Math.round(computation.predictedWasteMeals * 0.4);
    drafts.push({
      recommendationType: "donation",
      title: "Schedule surplus donation pickup",
      description: "Redirect unavoidable surplus to community partners",
      problem: `Waste forecast of ${computation.predictedWasteMeals} meals indicates redistribution opportunity`,
      evidence: [
        `Waste trend: ${snapshot.wasteTrend.toFixed(0)}%`,
        `Avg daily waste: ${snapshot.avgWastePerDay.toFixed(1)} units`,
      ],
      reasoning:
        "Surplus that cannot be prevented should be redirected to donation partners to maximize community impact.",
      priority: "medium",
      confidence: computation.confidence * 0.9,
      expectedSavings: mealsSaved * MEAL_COST_ESTIMATE * 0.5,
      expectedMealsSaved: mealsSaved,
      expectedImpact: `Rescue ${mealsSaved} meals for community distribution`,
      factors: [{ name: "Waste Forecast", importance: 0.75 }],
    });
  }

  if (snapshot.attendanceTrend < -8) {
    drafts.push({
      recommendationType: "purchasing",
      title: "Reduce purchasing orders by 10%",
      description: "Adjust orders to match declining attendance",
      problem: "Attendance declining faster than purchasing adjustments",
      evidence: [
        `Attendance trend: ${snapshot.attendanceTrend.toFixed(0)}%`,
        `Purchase spend in window: $${snapshot.purchaseSpend.toFixed(0)}`,
      ],
      reasoning:
        "Purchasing should lag attendance declines to prevent inventory accumulation and subsequent waste.",
      priority: "medium",
      confidence: computation.confidence * 0.85,
      expectedSavings: snapshot.purchaseSpend * 0.1,
      expectedMealsSaved: Math.round(computation.predictedWasteMeals * 0.2),
      expectedImpact: `Save ~$${Math.round(snapshot.purchaseSpend * 0.1)} in unnecessary orders`,
      factors: [{ name: "Attendance Decline", importance: 0.7 }],
    });
  }

  if (drafts.length === 0) {
    drafts.push({
      recommendationType: "operations",
      title: "Continue monitoring operational data",
      description: "Upload more attendance and waste records to improve forecast accuracy",
      problem: "Insufficient operational history for high-confidence interventions",
      evidence: ["Limited waste and attendance records in the analysis window"],
      reasoning:
        "More consistent data uploads will enable precise, actionable recommendations.",
      priority: "low",
      confidence: 0.5,
      expectedSavings: 0,
      expectedMealsSaved: 0,
      expectedImpact: "Improved forecast accuracy over time",
      factors: [{ name: "Data Coverage", importance: 0.5 }],
    });
  }

  return drafts;
}

export async function getLinkedRecommendationIds(forecastId: string) {
  const rows = await db
    .select({ id: recommendations.id })
    .from(recommendations)
    .where(eq(recommendations.forecast_id, forecastId));
  return rows.map((row) => row.id);
}
