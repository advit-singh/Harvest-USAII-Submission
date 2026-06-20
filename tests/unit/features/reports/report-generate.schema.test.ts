import { describe, expect, it } from "vitest";
import {
  reportGenerateSchema,
  toReportDateRange,
} from "@/features/reports/schemas/report-generate.schema";

describe("reportGenerateSchema", () => {
  it("accepts valid generate input", () => {
    const result = reportGenerateSchema.safeParse({
      template: "monthly_summary",
      siteId: "site_001",
      format: "pdf",
      dateRangePreset: "month",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing site", () => {
    const result = reportGenerateSchema.safeParse({
      template: "monthly_summary",
      siteId: "",
      format: "pdf",
      dateRangePreset: "month",
    });
    expect(result.success).toBe(false);
  });

  it("builds date range for month preset", () => {
    const range = toReportDateRange({
      template: "monthly_summary",
      siteId: "site_001",
      format: "pdf",
      dateRangePreset: "month",
    });
    expect(range.preset).toBe("month");
    expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
