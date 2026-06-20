/** API_SPEC §30–32 recommendations */

export type RecommendationPriority = "low" | "medium" | "high" | "critical";
export type RecommendationStatus = "open" | "accepted" | "rejected" | "snoozed" | "completed";
export type RecommendationAction = "accepted" | "rejected" | "completed" | "snoozed";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  siteId: string;
  siteName: string;
  createdAt: string;
}

export interface RecommendationActionInput {
  action: RecommendationAction;
  notes?: string;
}

export interface RecommendationDetail extends Recommendation {
  problem: string;
  evidence: string[];
  reasoning: string;
  linkedForecastId: string | null;
  expectedImpact: string;
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
}

export interface RecommendationAssignInput {
  assigneeId: string;
  notes?: string;
  dueDate?: string;
}
