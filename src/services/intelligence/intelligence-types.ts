import { z } from "zod";
import type { ForecastType } from "@/types/forecast";

export interface OperationalSnapshot {
  organizationId: string;
  siteId: string;
  windowDays: number;
  wasteMeals: number[];
  attendance: number[];
  expirationRiskItems: number;
  upcomingEvents: Array<{ name: string; expectedAttendance: number | null; startDate: Date }>;
  inventoryUnits: number;
  purchaseSpend: number;
  avgWastePerDay: number;
  avgAttendance: number;
  wasteTrend: number;
  attendanceTrend: number;
}

export interface ForecastComputation {
  forecastType: ForecastType;
  predictedValue: number;
  confidence: number;
  explanation: string;
  factors: Array<{ name: string; impactWeight: number; description: string }>;
  predictedSurplusMeals: number;
  predictedWasteMeals: number;
  expirationRiskItems: number;
  attendanceForecast: number;
  purchasingForecast: number;
  historyPoints: Array<{ date: string; value: number }>;
  trend: "up" | "down" | "stable";
}

export interface DraftRecommendation {
  recommendationType: string;
  title: string;
  description: string;
  problem: string;
  evidence: string[];
  reasoning: string;
  priority: "low" | "medium" | "high" | "critical";
  confidence: number;
  expectedSavings: number;
  expectedMealsSaved: number;
  expectedImpact: string;
  factors: Array<{ name: string; importance: number }>;
}

export const forecastReasoningSchema = z.object({
  factors: z.array(
    z.object({
      name: z.string(),
      impactWeight: z.number().min(0).max(1),
      description: z.string(),
    }),
  ),
  explanation: z.string(),
});

export type ForecastReasoningResult = z.infer<typeof forecastReasoningSchema>;
