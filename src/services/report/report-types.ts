import type { ReportDateRange, ReportFormat, ReportTemplateId } from "@/types/report";

export interface ReportGenerationInput {
  organizationId: string;
  siteId: string;
  siteName: string;
  template: ReportTemplateId;
  format: ReportFormat;
  dateRange: ReportDateRange;
  generatedBy: string;
  generatedByName: string;
}

export interface ReportSection {
  title: string;
  lines: string[];
}

export interface ReportContent {
  title: string;
  subtitle: string;
  sections: ReportSection[];
  metrics: Array<{ label: string; value: string }>;
}

export interface GeneratedReportFile {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}
