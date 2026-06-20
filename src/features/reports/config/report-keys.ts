import type { ReportFilters } from "@/types/report";

export const reportKeys = {
  all: ["reports"] as const,
  templates: (orgId: string) =>
    [...reportKeys.all, "templates", orgId] as const,
  list: (orgId: string, filters: ReportFilters) =>
    [...reportKeys.all, "list", orgId, filters] as const,
  detail: (reportId: string) =>
    [...reportKeys.all, "detail", reportId] as const,
};
