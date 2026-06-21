import { describe, expect, it } from "vitest";
import {
  getReportTemplate,
  getTemplateName,
  isFormatSupported,
  listReportTemplates,
} from "@/services/report/template-registry";

describe("template-registry", () => {
  it("lists all eight API templates", () => {
    const templates = listReportTemplates();
    expect(templates).toHaveLength(8);
    expect(templates.map((template) => template.id)).toContain("monthly_summary");
    expect(templates.map((template) => template.id)).toContain("school_board_report");
  });

  it("validates supported formats per template", () => {
    expect(isFormatSupported("monthly_summary", "pdf")).toBe(true);
    expect(isFormatSupported("monthly_summary", "csv")).toBe(true);
    expect(isFormatSupported("executive_summary", "csv")).toBe(false);
  });

  it("returns template names", () => {
    expect(getTemplateName("waste_report")).toBe("Waste Report");
    expect(getReportTemplate("donation_report")?.defaultFormat).toBe("pdf");
  });
});
