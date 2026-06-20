import { z } from "zod";
import type { ReportDateRangePreset, ReportFormat, ReportTemplateId } from "@/types/report";

export const reportDateRangePresetSchema = z.enum([
  "week",
  "month",
  "quarter",
  "year",
  "custom",
]);

export const reportFormatSchema = z.enum(["pdf", "docx", "csv"]);

export const reportTemplateIdSchema = z.enum([
  "monthly_summary",
  "waste_report",
  "donation_report",
  "executive_summary",
  "sustainability_report",
  "community_impact",
  "operations_review",
  "school_board_report",
]);

export const reportGenerateSchema = z.object({
  template: reportTemplateIdSchema,
  siteId: z.string().min(1, "Select a site"),
  format: reportFormatSchema,
  dateRangePreset: reportDateRangePresetSchema,
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),
});

export type ReportGenerateInput = z.infer<typeof reportGenerateSchema>;

export function toReportDateRange(
  input: ReportGenerateInput,
): { preset: ReportDateRangePreset; start: string; end: string } {
  if (input.dateRangePreset === "custom" && input.dateStart && input.dateEnd) {
    return {
      preset: "custom",
      start: input.dateStart,
      end: input.dateEnd,
    };
  }

  const end = new Date();
  const start = new Date(end);

  switch (input.dateRangePreset) {
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "quarter":
      start.setMonth(start.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "month":
    default:
      start.setMonth(start.getMonth() - 1);
      break;
  }

  return {
    preset: input.dateRangePreset,
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function defaultGenerateInput(
  template: ReportTemplateId = "monthly_summary",
  format: ReportFormat = "pdf",
): ReportGenerateInput {
  return {
    template,
    siteId: "site_001",
    format,
    dateRangePreset: "month",
  };
}
