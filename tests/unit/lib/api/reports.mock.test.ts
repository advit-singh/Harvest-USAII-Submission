import { describe, expect, it } from "vitest";
import {
  fetchReportById,
  fetchReports,
  fetchReportTemplates,
  generateReport,
} from "@/lib/api/reports";
import { DEMO_ORG } from "@/lib/mocks/reports-fixtures";
import { toReportDateRange } from "@/features/reports/schemas/report-generate.schema";

describe("reports mock API", () => {
  it("lists templates", async () => {
    const templates = await fetchReportTemplates(DEMO_ORG);
    expect(templates.length).toBeGreaterThanOrEqual(7);
    expect(templates[0].name).toBeTruthy();
  });

  it("lists reports for demo org", async () => {
    const reports = await fetchReports({ organizationId: DEMO_ORG });
    expect(reports.length).toBeGreaterThan(0);
    expect(reports[0].templateName).toBeTruthy();
  });

  it("returns report detail by id", async () => {
    const detail = await fetchReportById("rpt_001");
    expect(detail.id).toBe("rpt_001");
    expect(detail.status).toBe("ready");
  });

  it("generates a new report", async () => {
    const result = await generateReport({
      organizationId: DEMO_ORG,
      template: "executive_summary",
      siteId: "site_001",
      format: "pdf",
      dateRange: toReportDateRange({
        template: "executive_summary",
        siteId: "site_001",
        format: "pdf",
        dateRangePreset: "month",
      }),
    });
    expect(result.id).toBeTruthy();
    expect(result.status).toBe("queued");
  });
});
