import { jsPDF } from "jspdf";
import { getMockWasteAnalytics } from "@/lib/mocks/analytics-fixtures";
import { getOrgContext } from "@/lib/demo/org-context";
import { toAnalyticsFilters } from "@/features/analytics/config/analytics-tabs";
import { DEFAULT_ANALYTICS_FILTERS } from "@/features/analytics/schemas/analytics-filters.schema";
import type { ReportFormat } from "@/types/report";

export interface ClientReportContent {
  title: string;
  subtitle: string;
  metrics: Array<{ label: string; value: string }>;
  sections: Array<{ title: string; lines: string[] }>;
}

export function buildClientReportContent(
  orgId: string,
  fileName: string,
): ClientReportContent {
  const ctx = getOrgContext(orgId);
  const waste = getMockWasteAnalytics(orgId, toAnalyticsFilters(DEFAULT_ANALYTICS_FILTERS));

  return {
    title: `Harvest Report — ${fileName}`,
    subtitle: `${ctx.orgName} · ${ctx.primarySiteName} · Generated ${new Date().toLocaleString()}`,
    metrics: waste.summary.map((m) => ({
      label: m.label,
      value: `${m.value}${m.unit ? ` ${m.unit}` : ""}`,
    })),
    sections: [
      {
        title: "Waste by Category",
        lines: waste.byCategory.map(
          (c) => `${c.name}: ${c.value} ${c.unit ?? ""}`.trim(),
        ),
      },
      {
        title: "Root Cause",
        lines: [waste.rootCause.summary],
      },
    ],
  };
}

export function renderClientReportBlob(
  content: ClientReportContent,
  format: ReportFormat,
): Blob {
  if (format === "csv") {
    const rows = [
      ["section", "label", "value"],
      ["header", "title", content.title],
      ["header", "subtitle", content.subtitle],
      ...content.metrics.map((m) => ["metric", m.label, m.value]),
      ...content.sections.flatMap((s) =>
        s.lines.map((line) => ["section", s.title, line]),
      ),
    ];
    const csv = rows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    return new Blob([csv], { type: "text/csv" });
  }

  if (format === "pdf") {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    let y = 48;

    doc.setFontSize(18);
    doc.text(content.title, 48, y);
    y += 24;

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(content.subtitle, 48, y);
    y += 28;
    doc.setTextColor(0);

    doc.setFontSize(14);
    doc.text("Key Metrics", 48, y);
    y += 18;
    doc.setFontSize(11);
    for (const metric of content.metrics) {
      doc.text(`${metric.label}: ${metric.value}`, 56, y);
      y += 16;
      if (y > 720) {
        doc.addPage();
        y = 48;
      }
    }

    y += 8;
    for (const section of content.sections) {
      doc.setFontSize(14);
      doc.text(section.title, 48, y);
      y += 18;
      doc.setFontSize(11);
      for (const line of section.lines) {
        const wrapped = doc.splitTextToSize(`- ${line}`, 500);
        doc.text(wrapped, 56, y);
        y += wrapped.length * 14;
        if (y > 720) {
          doc.addPage();
          y = 48;
        }
      }
      y += 8;
    }

    return new Blob([doc.output("arraybuffer")], { type: "application/pdf" });
  }

  const text = [
    content.title,
    content.subtitle,
    "",
    "Key Metrics",
    ...content.metrics.map((m) => `${m.label}: ${m.value}`),
    "",
    ...content.sections.flatMap((s) => [s.title, ...s.lines.map((l) => `- ${l}`), ""]),
  ].join("\n");

  return new Blob([text], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
