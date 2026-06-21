import type { ReportFormat, ReportTemplate, ReportTemplateId } from "@/types/report";

const TEMPLATES: ReportTemplate[] = [
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

export function listReportTemplates(): ReportTemplate[] {
  return TEMPLATES;
}

export function getReportTemplate(id: ReportTemplateId): ReportTemplate | undefined {
  return TEMPLATES.find((template) => template.id === id);
}

export function isFormatSupported(templateId: ReportTemplateId, format: ReportFormat): boolean {
  const template = getReportTemplate(templateId);
  return template?.supportedFormats.includes(format) ?? false;
}

export function getTemplateName(id: ReportTemplateId): string {
  return getReportTemplate(id)?.name ?? id;
}
