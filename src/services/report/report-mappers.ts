import type { reports, users } from "@/db/schema";
import type {
  GenerateReportResponse,
  ReportDateRange,
  ReportDetail,
  ReportDownloadResponse,
  ReportFormat,
  ReportSummary,
  ReportTemplateId,
} from "@/types/report";
import { getTemplateName } from "./template-registry";

type ReportRow = typeof reports.$inferSelect;
type UserRow = typeof users.$inferSelect;

export function mapReportSummary(
  row: ReportRow,
  siteName: string,
  userName: string,
): ReportSummary {
  const dateRange = (row.date_range ?? {
    preset: "month",
    start: "",
    end: "",
  }) as ReportDateRange;

  return {
    id: row.id,
    organizationId: row.organization_id,
    template: row.report_type as ReportTemplateId,
    templateName: getTemplateName(row.report_type as ReportTemplateId),
    siteId: row.site_id ?? "",
    siteName,
    format: (row.format ?? "pdf") as ReportFormat,
    status: row.status as ReportSummary["status"],
    generatedBy: row.generated_by,
    generatedByName: userName,
    createdAt: row.created_at.toISOString(),
    generatedAt: row.generated_at?.toISOString() ?? null,
    dateRange,
  };
}

export function mapReportDetail(
  row: ReportRow,
  siteName: string,
  userName: string,
): ReportDetail {
  return {
    ...mapReportSummary(row, siteName, userName),
    progress: row.progress ?? 0,
    errorMessage: row.error_message ?? null,
  };
}

export function mapGenerateResponse(row: ReportRow): GenerateReportResponse {
  return {
    id: row.id,
    status: row.status as GenerateReportResponse["status"],
    template: row.report_type as ReportTemplateId,
    format: (row.format ?? "pdf") as ReportFormat,
    createdAt: row.created_at.toISOString(),
  };
}

export function mapDownloadResponse(
  fileUrl: string,
  fileName: string,
  format: ReportFormat,
  expiresAt: string,
): ReportDownloadResponse {
  return { fileUrl, fileName, format, expiresAt };
}

export function formatUserName(user: UserRow | null | undefined): string {
  if (!user) return "Unknown User";
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return name || user.email;
}
