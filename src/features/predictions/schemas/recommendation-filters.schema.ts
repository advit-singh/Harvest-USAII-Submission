import { z } from "zod";

export const recommendationStatusFilterSchema = z.enum([
  "all",
  "open",
  "accepted",
  "rejected",
  "snoozed",
  "completed",
]);

export const recommendationPriorityFilterSchema = z.enum([
  "all",
  "low",
  "medium",
  "high",
  "critical",
]);

export const recommendationFiltersSchema = z.object({
  status: recommendationStatusFilterSchema,
  priority: recommendationPriorityFilterSchema,
  siteId: z.string().nullable(),
  sortBy: z.enum(["priority", "createdAt", "confidence"]),
});

export type RecommendationFiltersInput = z.infer<
  typeof recommendationFiltersSchema
>;

export const DEFAULT_RECOMMENDATION_FILTERS: RecommendationFiltersInput = {
  status: "open",
  priority: "all",
  siteId: null,
  sortBy: "priority",
};
