import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled } from "@/lib/api/api-mode";
import type {
  CreateReportSchedulePayload,
  ReportSchedule,
  UpdateReportSchedulePayload,
} from "@/types/report";

let mockSchedules: ReportSchedule[] = [
  {
    id: "sched_001",
    organizationId: "org_demo",
    siteId: "site_001",
    siteName: "Lincoln Elementary Cafeteria",
    template: "monthly_summary",
    templateName: "Monthly Summary",
    format: "pdf",
    cadence: "weekly",
    dayOfWeek: 1,
    dayOfMonth: null,
    timezone: "America/Chicago",
    isActive: true,
    lastRunAt: null,
    nextRunAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export async function fetchReportSchedules(orgId: string): Promise<ReportSchedule[]> {
  if (isMockApiEnabled()) {
    return mockSchedules.filter((s) => s.organizationId === orgId || orgId.startsWith("org_"));
  }
  const params = new URLSearchParams({ organizationId: orgId });
  return apiClient<ReportSchedule[]>(`/reports/schedules?${params.toString()}`);
}

export async function createReportSchedule(
  payload: CreateReportSchedulePayload,
): Promise<ReportSchedule> {
  if (isMockApiEnabled()) {
    const schedule: ReportSchedule = {
      id: `sched_${Date.now()}`,
      organizationId: payload.organizationId,
      siteId: payload.siteId,
      siteName: "Site",
      template: payload.template,
      templateName: payload.template,
      format: payload.format,
      cadence: payload.cadence,
      dayOfWeek: payload.dayOfWeek ?? null,
      dayOfMonth: payload.dayOfMonth ?? null,
      timezone: payload.timezone,
      isActive: true,
      lastRunAt: null,
      nextRunAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      createdAt: new Date().toISOString(),
    };
    mockSchedules = [schedule, ...mockSchedules];
    return schedule;
  }
  return apiClient<ReportSchedule>("/reports/schedules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReportSchedule(
  id: string,
  organizationId: string,
  patch: UpdateReportSchedulePayload,
): Promise<ReportSchedule> {
  if (isMockApiEnabled()) {
    const index = mockSchedules.findIndex((s) => s.id === id);
    if (index < 0) throw new Error("Schedule not found");
    mockSchedules[index] = { ...mockSchedules[index], ...patch };
    return mockSchedules[index];
  }
  return apiClient<ReportSchedule>(`/reports/schedules/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ organizationId, ...patch }),
  });
}

export async function deleteReportSchedule(id: string, organizationId: string): Promise<void> {
  if (isMockApiEnabled()) {
    mockSchedules = mockSchedules.filter((s) => s.id !== id);
    return;
  }
  const params = new URLSearchParams({ organizationId });
  await apiClient<{ id: string }>(`/reports/schedules/${id}?${params.toString()}`, {
    method: "DELETE",
  });
}

export function resetMockSchedules(): void {
  mockSchedules = [];
}
