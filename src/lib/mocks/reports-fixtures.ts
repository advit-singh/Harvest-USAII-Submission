import type {
  GenerateReportPayload,
  ReportDetail,
  ReportDownloadResponse,
  ReportFormat,
  ReportStatus,
  ReportSummary,
  ReportTemplate,
  ReportTemplateId,
} from "@/types/report";

export const DEMO_ORG = "org_demo_123";
export const DEMO_SITE_ID = "site_001";
export const DEMO_SITE_NAME = "Lincoln Elementary Cafeteria";

const TEMPLATE_NAMES: Record<ReportTemplateId, string> = {
  monthly_summary: "Monthly Summary",
  waste_report: "Waste Report",
  donation_report: "Donation Report",
  executive_summary: "Executive Summary",
  sustainability_report: "Sustainability Report",
  community_impact: "Community Impact Report",
  operations_review: "Operations Review",
  school_board_report: "School Board Report",
};

export const MOCK_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "monthly_summary",
    name: "Monthly Summary",
    description: "Overview of waste, inventory, forecasts, and impact for the period",
    supportedFormats: ["pdf", "docx", "csv"],
    defaultFormat: "pdf",
  },
  {
    id: "waste_report",
    name: "Waste Report",
    description: "Detailed waste trends, root causes, and prevention opportunities",
    supportedFormats: ["pdf", "docx", "csv"],
    defaultFormat: "pdf",
  },
  {
    id: "donation_report",
    name: "Donation Report",
    description: "Surplus redistribution, recipient matches, and rescue outcomes",
    supportedFormats: ["pdf", "docx", "csv"],
    defaultFormat: "pdf",
  },
  {
    id: "executive_summary",
    name: "Executive Summary",
    description: "High-level KPIs for leadership and board presentations",
    supportedFormats: ["pdf", "docx"],
    defaultFormat: "pdf",
  },
  {
    id: "sustainability_report",
    name: "Sustainability Report",
    description: "Environmental impact metrics: CO₂ avoided, water saved, landfill reduction",
    supportedFormats: ["pdf", "docx", "csv"],
    defaultFormat: "pdf",
  },
  {
    id: "community_impact",
    name: "Community Impact Report",
    description: "Meals rescued, people served, and community partnership outcomes",
    supportedFormats: ["pdf", "docx"],
    defaultFormat: "pdf",
  },
  {
    id: "operations_review",
    name: "Operations Review",
    description: "Upload activity, validation issues, and operational health",
    supportedFormats: ["pdf", "csv"],
    defaultFormat: "pdf",
  },
  {
    id: "school_board_report",
    name: "School Board Report",
    description: "Board-ready summary of cafeteria waste and cost savings",
    supportedFormats: ["pdf", "docx"],
    defaultFormat: "pdf",
  },
];

function defaultDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);
  return {
    preset: "month" as const,
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

let mockReports: ReportDetail[] = [
  {
    id: "rpt_001",
    organizationId: DEMO_ORG,
    template: "monthly_summary",
    templateName: "Monthly Summary",
    siteId: DEMO_SITE_ID,
    siteName: DEMO_SITE_NAME,
    format: "pdf",
    status: "ready",
    generatedBy: "user_demo",
    generatedByName: "Demo User",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    generatedAt: new Date(Date.now() - 86400000 * 3 + 5000).toISOString(),
    dateRange: defaultDateRange(),
    progress: 100,
    errorMessage: null,
  },
  {
    id: "rpt_002",
    organizationId: DEMO_ORG,
    template: "waste_report",
    templateName: "Waste Report",
    siteId: DEMO_SITE_ID,
    siteName: DEMO_SITE_NAME,
    format: "csv",
    status: "ready",
    generatedBy: "user_demo",
    generatedByName: "Demo User",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    generatedAt: new Date(Date.now() - 86400000 * 7 + 4000).toISOString(),
    dateRange: defaultDateRange(),
    progress: 100,
    errorMessage: null,
  },
];

const processingTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

type ReportReadyCallback = (report: ReportDetail) => void;
let onReportReady: ReportReadyCallback | null = null;

export function setReportReadyCallback(cb: ReportReadyCallback | null): void {
  onReportReady = cb;
}

export function getMockReportTemplates(): ReportTemplate[] {
  return MOCK_REPORT_TEMPLATES;
}

export function getMockReports(orgId: string): ReportDetail[] {
  return mockReports.filter((r) => r.organizationId === orgId);
}

export function getMockReportById(id: string): ReportDetail | undefined {
  return mockReports.find((r) => r.id === id);
}

export function resetMockReports(): void {
  processingTimers.forEach((timers) => timers.forEach(clearTimeout));
  processingTimers.clear();
  mockReports = mockReports.filter((r) => r.status === "ready");
}

function clearTimers(reportId: string): void {
  const timers = processingTimers.get(reportId);
  if (timers) {
    timers.forEach(clearTimeout);
    processingTimers.delete(reportId);
  }
}

function scheduleProcessing(reportId: string): void {
  clearTimers(reportId);
  const timers: ReturnType<typeof setTimeout>[] = [];

  timers.push(
    setTimeout(() => {
      const report = mockReports.find((r) => r.id === reportId);
      if (report && report.status === "queued") {
        report.status = "generating";
        report.progress = 35;
      }
    }, 800),
  );

  timers.push(
    setTimeout(() => {
      const report = mockReports.find((r) => r.id === reportId);
      if (report && report.status === "generating") {
        report.progress = 70;
      }
    }, 1800),
  );

  timers.push(
    setTimeout(() => {
      const report = mockReports.find((r) => r.id === reportId);
      if (report) {
        report.status = "ready";
        report.progress = 100;
        report.generatedAt = new Date().toISOString();
        onReportReady?.({ ...report });
      }
      clearTimers(reportId);
    }, 3200),
  );

  processingTimers.set(reportId, timers);
}

export function createMockReport(
  payload: GenerateReportPayload,
): ReportDetail {
  const id = `rpt_${Date.now()}`;
  const templateName = TEMPLATE_NAMES[payload.template];
  const report: ReportDetail = {
    id,
    organizationId: payload.organizationId,
    template: payload.template,
    templateName,
    siteId: payload.siteId,
    siteName:
      payload.siteId === DEMO_SITE_ID ? DEMO_SITE_NAME : payload.siteId,
    format: payload.format,
    status: "queued",
    generatedBy: "user_demo",
    generatedByName: "Demo User",
    createdAt: new Date().toISOString(),
    generatedAt: null,
    dateRange: payload.dateRange,
    progress: 5,
    errorMessage: null,
  };
  mockReports = [report, ...mockReports];
  scheduleProcessing(id);
  return report;
}

export function getMockReportDownload(
  reportId: string,
): ReportDownloadResponse | null {
  const report = mockReports.find((r) => r.id === reportId);
  if (!report || report.status !== "ready") return null;

  const slug = report.templateName.toLowerCase().replace(/\s+/g, "-");
  const ext = report.format;
  return {
    fileUrl: `blob:mock-report-${reportId}`,
    fileName: `${slug}-${report.dateRange.start}.${ext}`,
    format: report.format,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
}

export function toReportSummary(report: ReportDetail): ReportSummary {
  const { progress, errorMessage, ...summary } = report;
  void progress;
  void errorMessage;
  return summary;
}

export function formatLabel(format: ReportFormat): string {
  return format.toUpperCase();
}
