import PDFDocument from "pdfkit";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { ReportFormat } from "@/types/report";
import type { GeneratedReportFile, ReportContent } from "./report-types";

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildReportFileName(title: string, format: ReportFormat, dateEnd: string): string {
  const datePart = dateEnd.slice(0, 7);
  return `${slugify(title)}-${datePart}.${format}`;
}

export async function renderReportFile(
  content: ReportContent,
  format: ReportFormat,
  dateEnd: string,
): Promise<GeneratedReportFile> {
  if (format === "csv") {
    return renderCsv(content, dateEnd);
  }
  if (format === "docx") {
    return renderDocx(content, dateEnd);
  }
  return renderPdf(content, dateEnd);
}

async function renderCsv(content: ReportContent, dateEnd: string): Promise<GeneratedReportFile> {
  const rows: string[] = [
    "section,label,value",
    `header,title,"${content.title.replace(/"/g, '""')}"`,
    `header,subtitle,"${content.subtitle.replace(/"/g, '""')}"`,
  ];

  for (const metric of content.metrics) {
    rows.push(`metric,"${metric.label.replace(/"/g, '""')}","${metric.value.replace(/"/g, '""')}"`);
  }

  for (const section of content.sections) {
    for (const line of section.lines) {
      rows.push(
        `section,"${section.title.replace(/"/g, '""')}","${line.replace(/"/g, '""')}"`,
      );
    }
  }

  const buffer = Buffer.from(rows.join("\n"), "utf-8");
  return {
    buffer,
    fileName: buildReportFileName(content.title, "csv", dateEnd),
    mimeType: "text/csv",
  };
}

async function renderPdf(content: ReportContent, dateEnd: string): Promise<GeneratedReportFile> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(20).text(content.title, { underline: true });
  doc.moveDown();
  doc.fontSize(12).fillColor("#444").text(content.subtitle);
  doc.moveDown();

  doc.fontSize(14).fillColor("#000").text("Key Metrics");
  doc.moveDown(0.5);
  for (const metric of content.metrics) {
    doc.fontSize(11).text(`${metric.label}: ${metric.value}`);
  }
  doc.moveDown();

  for (const section of content.sections) {
    doc.fontSize(14).text(section.title);
    doc.moveDown(0.5);
    for (const line of section.lines) {
      doc.fontSize(11).text(`• ${line}`);
    }
    doc.moveDown();
  }

  doc.end();
  const buffer = await finished;

  return {
    buffer,
    fileName: buildReportFileName(content.title, "pdf", dateEnd),
    mimeType: "application/pdf",
  };
}

async function renderDocx(content: ReportContent, dateEnd: string): Promise<GeneratedReportFile> {
  const children: Paragraph[] = [
    new Paragraph({
      text: content.title,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: content.subtitle }),
    new Paragraph({ text: "" }),
    new Paragraph({ text: "Key Metrics", heading: HeadingLevel.HEADING_2 }),
    ...content.metrics.map(
      (metric) =>
        new Paragraph({
          children: [new TextRun({ text: `${metric.label}: ${metric.value}` })],
        }),
    ),
  ];

  for (const section of content.sections) {
    children.push(
      new Paragraph({ text: "" }),
      new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_2 }),
      ...section.lines.map((line) => new Paragraph({ text: `• ${line}` })),
    );
  }

  const document = new Document({ sections: [{ children }] });
  const buffer = Buffer.from(await Packer.toBuffer(document));

  return {
    buffer,
    fileName: buildReportFileName(content.title, "docx", dateEnd),
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}
