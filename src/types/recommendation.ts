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
