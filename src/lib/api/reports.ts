import { apiClient } from "@/lib/api/client";
import {
  createMockReport,
  getMockReportById,
  getMockReportDownload,
  getMockReportTemplates,
  getMockReports,
  setReportReadyCallback,
} from "@/lib/mocks/reports-fixtures";
import { pushMockReportNotification } from "@/lib/api/notifications";
import type {
  GenerateReportPayload,
  GenerateReportResponse,
  ReportDetail,
  ReportDownloadResponse,
  ReportFilters,
  ReportSummary,
  ReportTemplate,
} from "@/types/report";

const MOCK_DELAY_MS = 150;

async function mockDelay(extra = 0): Promise<void> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS + extra));
}

setReportReadyCallback((report) => {
  pushMockReportNotification(report);
});

export async function fetchReportTemplates(
  _orgId?: string,
): Promise<ReportTemplate[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await mockDelay();
    return getMockReportTemplates();
  }
  const params = _orgId ? `?organizationId=${_orgId}` : "";
  return apiClient<ReportTemplate[]>(`/reports/templates${params}`);
}

export async function fetchReports(
  filters: ReportFilters,
): Promise<ReportSummary[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await mockDelay();
    let items = getMockReports(filters.organizationId);

    if (filters.status && filters.status !== "all") {
      items = items.filter((r) => r.status === filters.status);
    }
    if (filters.template && filters.template !== "all") {
      items = items.filter((r) => r.template === filters.template);
    }
    if (filters.siteId && filters.siteId !== "all") {
      items = items.filter((r) => r.siteId === filters.siteId);
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (r) =>
          r.templateName.toLowerCase().includes(q) ||
          r.siteName.toLowerCase().includes(q),
      );
    }

    return items.map(({ progress, errorMessage, ...summary }) => summary);
  }

  const params = new URLSearchParams({
    organizationId: filters.organizationId,
  });
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.template && filters.template !== "all") {
    params.set("template", filters.template);
  }
  if (filters.siteId && filters.siteId !== "all") {
    params.set("siteId", filters.siteId);
  }

  return apiClient<ReportSummary[]>(`/reports?${params.toString()}`);
}

export async function fetchReportById(id: string): Promise<ReportDetail> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await mockDelay();
    const report = getMockReportById(id);
    if (!report) {
      throw new Error("Report not found");
    }
    return { ...report };
  }
  return apiClient<ReportDetail>(`/reports/${id}`);
}

export async function generateReport(
  payload: GenerateReportPayload,
): Promise<GenerateReportResponse> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await mockDelay(100);
    const report = createMockReport(payload);
    return {
      id: report.id,
      status: report.status,
      template: report.template,
      format: report.format,
      createdAt: report.createdAt,
    };
  }
  return apiClient<GenerateReportResponse>("/reports/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function downloadReport(
  reportId: string,
): Promise<ReportDownloadResponse> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API !== "false") {
    await mockDelay(80);
    const download = getMockReportDownload(reportId);
    if (!download) {
      throw new Error("Report is not ready for download");
    }
    return download;
  }
  return apiClient<ReportDownloadResponse>(`/reports/${reportId}/download`);
}

export { setReportReadyCallback };
