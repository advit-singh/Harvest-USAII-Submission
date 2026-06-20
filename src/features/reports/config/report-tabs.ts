import type { ReportDateRangePreset, ReportTabId } from "@/types/report";
import type { ReportFiltersInput } from "@/features/reports/schemas/report-filters.schema";
import type { ReportFilters } from "@/types/report";
import {
  CalendarClock,
  Download,
  FileStack,
  LayoutTemplate,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ReportTabConfig {
  id: ReportTabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const REPORT_TABS: ReportTabConfig[] = [
  {
    id: "templates",
    label: "Templates",
    description: "Browse report templates",
    icon: LayoutTemplate,
  },
  {
    id: "generated",
    label: "Generated",
    description: "View generated reports",
    icon: FileStack,
  },
  {
    id: "scheduled",
    label: "Scheduled",
    description: "Automated report schedules",
    icon: CalendarClock,
  },
  {
    id: "exports",
    label: "Exports",
    description: "Download ready exports",
    icon: Download,
  },
];

export const VALID_REPORT_TABS: ReportTabId[] = REPORT_TABS.map((t) => t.id);

export function toReportFilters(
  input: ReportFiltersInput,
  orgId: string,
): ReportFilters {
  return {
    organizationId: orgId,
    status: input.status,
    template: input.template,
    siteId: input.siteId !== "all" ? input.siteId : undefined,
    search: input.search.trim() || undefined,
  };
}

export const REPORT_SITE_OPTIONS = [
  { value: "all", label: "All sites" },
  { value: "site_001", label: "Lincoln Elementary Cafeteria" },
];

export const DATE_RANGE_OPTIONS: {
  value: ReportDateRangePreset;
  label: string;
}[] = [
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
  { value: "quarter", label: "Last quarter" },
  { value: "year", label: "Last year" },
  { value: "custom", label: "Custom range" },
];

export const FORMAT_OPTIONS = [
  { value: "pdf" as const, label: "PDF" },
  { value: "docx" as const, label: "DOCX" },
  { value: "csv" as const, label: "CSV" },
];
