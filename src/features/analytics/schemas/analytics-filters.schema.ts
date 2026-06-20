import { z } from "zod";

export const analyticsTimeRangeSchema = z.enum([
  "week",
  "month",
  "quarter",
  "year",
]);

export const analyticsTabIdSchema = z.enum([
  "waste",
  "inventory",
  "attendance",
  "donations",
  "impact",
]);

export const hierarchyLevelSchema = z.enum([
  "organization",
  "region",
  "campus",
  "building",
  "kitchen",
  "storage",
]);

export const analyticsFiltersSchema = z.object({
  timeRange: analyticsTimeRangeSchema,
  siteId: z.string().nullable(),
  hierarchyLevel: hierarchyLevelSchema,
  hierarchyId: z.string().nullable(),
  category: z.string().nullable(),
  eventId: z.string().nullable(),
});

export type AnalyticsFiltersInput = z.infer<typeof analyticsFiltersSchema>;

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFiltersInput = {
  timeRange: "month",
  siteId: null,
  hierarchyLevel: "organization",
  hierarchyId: null,
  category: null,
  eventId: null,
};
