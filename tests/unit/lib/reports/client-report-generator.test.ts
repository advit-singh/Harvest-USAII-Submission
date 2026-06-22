import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";
import {
  buildClientReportContent,
  renderClientReportBlob,
} from "@/lib/reports/client-report-generator";

describe("client-report-generator", () => {
  it("produces a valid PDF blob", () => {
    const content = buildClientReportContent("org_demo_123", "monthly-summary.pdf");
    const blob = renderClientReportBlob(content, "pdf");
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(100);
  });

  it("jsPDF output starts with PDF header", () => {
    const content = buildClientReportContent("org_demo_123", "monthly-summary.pdf");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.text(content.title, 48, 48);
    const bytes = new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe("%PDF");
  });
});
