import { z } from "zod";

export const widgetIdSchema = z.enum([
  "waste-risk",
  "predicted-surplus",
  "recommendations",
  "inventory-health",
  "impact-snapshot",
  "donation-opportunities",
  "recent-activity",
]);

export const gridLayoutItemSchema = z.object({
  i: widgetIdSchema,
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1),
  h: z.number().int().min(1),
  minW: z.number().int().min(1).optional(),
  minH: z.number().int().min(1).optional(),
});

export const dashboardLayoutStateSchema = z.object({
  layouts: z.array(gridLayoutItemSchema),
  visibility: z.record(widgetIdSchema, z.boolean()),
  updatedAt: z.string(),
});

export const impactTimeRangeSchema = z.enum([
  "week",
  "month",
  "quarter",
  "year",
]);

export const recommendationActionSchema = z.object({
  action: z.enum(["accepted", "rejected", "completed", "snoozed"]),
  notes: z.string().optional(),
});

export type DashboardLayoutStateInput = z.infer<typeof dashboardLayoutStateSchema>;
