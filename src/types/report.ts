/** API_SPEC §41–43 reports */

export type ReportTemplateId =
  | "monthly_summary"
  | "waste_report"
  | "donation_report"
  | "executive_summary"
  | "sustainability_report"
  | "community_impact"
  | "operations_review"
  | "school_board_report";

export type ReportFormat = "pdf" | "docx" | "csv";

export type ReportStatus = "queued" | "generating" | "ready" | "failed";

export type ReportTabId = "templates" | "generated" | "scheduled" | "exports";

export type ReportDateRangePreset =
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "custom";

export interface ReportDateRange {
  preset: ReportDateRangePreset;
  start: string;
  end: string;
}

export interface ReportTemplate {
  id: ReportTemplateId;
  name: string;
  description: string;
  supportedFormats: ReportFormat[];
  defaultFormat: ReportFormat;
}

export interface ReportSummary {
  id: string;
  organizationId: string;
  template: ReportTemplateId;
  templateName: string;
  siteId: string;
  siteName: string;
  format: ReportFormat;
  status: ReportStatus;
  generatedBy: string;
  generatedByName: string;
  createdAt: string;
  generatedAt: string | null;
  dateRange: ReportDateRange;
}

export interface ReportDetail extends ReportSummary {
  progress: number;
  errorMessage: string | null;
}

export interface GenerateReportPayload {
  organizationId: string;
  template: ReportTemplateId;
  siteId: string;
  format: ReportFormat;
  dateRange: ReportDateRange;
}

export interface GenerateReportResponse {
  id: string;
  status: ReportStatus;
  template: ReportTemplateId;
  format: ReportFormat;
  createdAt: string;
}

export interface ReportDownloadResponse {
  fileUrl: string;
  fileName: string;
  format: ReportFormat;
  expiresAt: string;
}

export interface ReportFilters {
  organizationId: string;
  status?: ReportStatus | "all";
  template?: ReportTemplateId | "all";
  siteId?: string | "all";
  search?: string;
}

export function isProcessingReportStatus(status: ReportStatus): boolean {
  return status === "queued" || status === "generating";
}
