import { z } from "zod";

export const predictionsTimeRangeSchema = z.enum(["week", "month", "quarter"]);

export const predictionsTabIdSchema = z.enum([
  "summary",
  "explorer",
  "recommendations",
  "simulator",
]);

export const predictionsFiltersSchema = z.object({
  timeRange: predictionsTimeRangeSchema,
  siteId: z.string().nullable(),
  category: z.string().nullable(),
  itemId: z.string().nullable(),
  forecastType: z.string().nullable(),
});

export type PredictionsFiltersInput = z.infer<typeof predictionsFiltersSchema>;

export const DEFAULT_PREDICTIONS_FILTERS: PredictionsFiltersInput = {
  timeRange: "week",
  siteId: null,
  category: null,
  itemId: null,
  forecastType: null,
};
