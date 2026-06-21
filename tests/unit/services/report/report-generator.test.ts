import { describe, expect, it } from "vitest";
import { renderReportFile } from "@/services/report/report-generator";
import type { ReportContent } from "@/services/report/report-types";

const sampleContent: ReportContent = {
  title: "Monthly Summary",
  subtitle: "Main Kitchen · 2026-05-01 to 2026-05-31",
  metrics: [{ label: "Risk Score", value: "42" }],
  sections: [{ title: "Waste Analysis", lines: ["Total waste: 120 kg"] }],
};

describe("report-generator", () => {
  it("renders CSV with section rows", async () => {
    const file = await renderReportFile(sampleContent, "csv", "2026-05-31");
    const text = file.buffer.toString("utf-8");
    expect(file.fileName).toContain(".csv");
    expect(text).toContain("Waste Analysis");
    expect(text).toContain("Total waste: 120 kg");
  });

  it("renders PDF bytes", async () => {
    const file = await renderReportFile(sampleContent, "pdf", "2026-05-31");
    expect(file.fileName).toContain(".pdf");
    expect(file.buffer.subarray(0, 4).toString()).toBe("%PDF");
  });

  it("renders DOCX bytes", async () => {
    const file = await renderReportFile(sampleContent, "docx", "2026-05-31");
    expect(file.fileName).toContain(".docx");
    expect(file.buffer.length).toBeGreaterThan(100);
  });
});
