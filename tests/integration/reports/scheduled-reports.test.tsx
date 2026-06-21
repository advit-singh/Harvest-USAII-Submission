import { describe, expect, it } from "vitest";
import {
  createReportSchedule,
  fetchReportSchedules,
  resetMockSchedules,
} from "@/lib/api/report-schedules";

describe("report schedules mock client", () => {
  it("creates and lists schedules in mock mode", async () => {
    resetMockSchedules();
    const created = await createReportSchedule({
      organizationId: "org_test",
      siteId: "site_001",
      template: "monthly_summary",
      format: "pdf",
      cadence: "weekly",
      timezone: "UTC",
      dayOfWeek: 1,
    });
    expect(created.id).toBeTruthy();
    const list = await fetchReportSchedules("org_test");
    expect(list.length).toBeGreaterThan(0);
  });
});
