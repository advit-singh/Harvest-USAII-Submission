import { z } from "zod";
import { reportTemplateIdSchema } from "@/features/reports/schemas/report-generate.schema";

export const reportStatusFilterSchema = z.enum([
  "all",
  "queued",
  "generating",
  "ready",
  "failed",
]);

export const reportFiltersSchema = z.object({
  status: reportStatusFilterSchema,
  template: z.union([reportTemplateIdSchema, z.literal("all")]),
  siteId: z.string(),
  search: z.string(),
});

export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>;

export const DEFAULT_REPORT_FILTERS: ReportFiltersInput = {
  status: "all",
  template: "all",
  siteId: "all",
  search: "",
};
