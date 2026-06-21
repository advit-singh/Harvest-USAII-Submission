import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { report_schedules } from "@/db/schema";
import { queueReportGeneration } from "@/services/report/report-service";
import { getReportTemplate, getTemplateName } from "@/services/report/template-registry";
import type {
  CreateReportSchedulePayload,
  ReportCadence,
  ReportDateRange,
  ReportSchedule,
  RunDueSchedulesResult,
  UpdateReportSchedulePayload,
} from "@/types/report";

function defaultDateRange(): ReportDateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    preset: "month",
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function computeNextRunAt(
  cadence: ReportCadence,
  timezone: string,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
  from: Date = new Date(),
): Date {
  const next = new Date(from);

  if (cadence === "daily") {
    next.setDate(next.getDate() + 1);
    next.setHours(8, 0, 0, 0);
    return next;
  }

  if (cadence === "weekly") {
    const targetDay = dayOfWeek ?? 1;
    const currentDay = next.getDay();
    let daysUntil = (targetDay - currentDay + 7) % 7;
    if (daysUntil === 0) daysUntil = 7;
    next.setDate(next.getDate() + daysUntil);
    next.setHours(8, 0, 0, 0);
    return next;
  }

  const targetDom = dayOfMonth ?? 1;
  next.setMonth(next.getMonth() + 1);
  next.setDate(Math.min(targetDom, 28));
  next.setHours(8, 0, 0, 0);
  void timezone;
  return next;
}

async function mapScheduleRow(
  row: typeof report_schedules.$inferSelect,
): Promise<ReportSchedule> {
  const site = await db.query.organization_sites.findFirst({
    where: (fields, { eq: eqFn }) => eqFn(fields.id, row.site_id),
  });
  return {
    id: row.id,
    organizationId: row.organization_id,
    siteId: row.site_id,
    siteName: site?.name ?? "Unknown Site",
    template: row.template_id as ReportSchedule["template"],
    templateName: getTemplateName(row.template_id as ReportSchedule["template"]),
    format: row.format as ReportSchedule["format"],
    cadence: row.cadence as ReportCadence,
    dayOfWeek: row.day_of_week,
    dayOfMonth: row.day_of_month,
    timezone: row.timezone,
    isActive: row.is_active,
    lastRunAt: row.last_run_at?.toISOString() ?? null,
    nextRunAt: row.next_run_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listSchedules(organizationId: string): Promise<ReportSchedule[]> {
  const rows = await db
    .select()
    .from(report_schedules)
    .where(eq(report_schedules.organization_id, organizationId));

  return Promise.all(rows.map((row) => mapScheduleRow(row)));
}

export async function createSchedule(
  payload: CreateReportSchedulePayload,
  userId: string,
): Promise<ReportSchedule> {
  if (!getReportTemplate(payload.template)) {
    throw new Error("INVALID_TEMPLATE");
  }

  const site = await db.query.organization_sites.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(fields.id, payload.siteId),
        eqFn(fields.organization_id, payload.organizationId),
      ),
  });
  if (!site) {
    throw new Error("INVALID_SITE");
  }

  const nextRunAt = computeNextRunAt(
    payload.cadence,
    payload.timezone,
    payload.dayOfWeek,
    payload.dayOfMonth,
  );

  const [row] = await db
    .insert(report_schedules)
    .values({
      organization_id: payload.organizationId,
      site_id: payload.siteId,
      template_id: payload.template,
      format: payload.format,
      cadence: payload.cadence,
      day_of_week: payload.dayOfWeek ?? null,
      day_of_month: payload.dayOfMonth ?? null,
      timezone: payload.timezone,
      is_active: true,
      next_run_at: nextRunAt,
      created_by: userId,
    })
    .returning();

  return mapScheduleRow(row);
}

export async function updateSchedule(
  id: string,
  organizationId: string,
  patch: UpdateReportSchedulePayload,
): Promise<ReportSchedule | null> {
  const existing = await db.query.report_schedules.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, id), eqFn(fields.organization_id, organizationId)),
  });
  if (!existing) return null;

  const cadence = (patch.cadence ?? existing.cadence) as ReportCadence;
  const timezone = patch.timezone ?? existing.timezone;
  const dayOfWeek = patch.dayOfWeek !== undefined ? patch.dayOfWeek : existing.day_of_week;
  const dayOfMonth = patch.dayOfMonth !== undefined ? patch.dayOfMonth : existing.day_of_month;

  const nextRunAt =
    patch.cadence !== undefined ||
    patch.timezone !== undefined ||
    patch.dayOfWeek !== undefined ||
    patch.dayOfMonth !== undefined
      ? computeNextRunAt(cadence, timezone, dayOfWeek, dayOfMonth)
      : existing.next_run_at;

  const [row] = await db
    .update(report_schedules)
    .set({
      site_id: patch.siteId ?? existing.site_id,
      template_id: patch.template ?? existing.template_id,
      format: patch.format ?? existing.format,
      cadence: patch.cadence ?? existing.cadence,
      day_of_week: dayOfWeek,
      day_of_month: dayOfMonth,
      timezone,
      is_active: patch.isActive ?? existing.is_active,
      next_run_at: nextRunAt,
      updated_at: new Date(),
    })
    .where(eq(report_schedules.id, id))
    .returning();

  return mapScheduleRow(row);
}

export async function deleteSchedule(id: string, organizationId: string): Promise<boolean> {
  const result = await db
    .delete(report_schedules)
    .where(
      and(eq(report_schedules.id, id), eq(report_schedules.organization_id, organizationId)),
    )
    .returning({ id: report_schedules.id });
  return result.length > 0;
}

export async function processDueSchedules(
  organizationId?: string,
): Promise<RunDueSchedulesResult> {
  const now = new Date();
  const conditions = [
    eq(report_schedules.is_active, true),
    lte(report_schedules.next_run_at, now),
  ];
  if (organizationId) {
    conditions.push(eq(report_schedules.organization_id, organizationId));
  }

  const due = await db
    .select()
    .from(report_schedules)
    .where(and(...conditions))
    .limit(20);

  const reportIds: string[] = [];

  for (const schedule of due) {
    const userId = schedule.created_by;
    if (!userId) continue;

    try {
      const result = await queueReportGeneration(
        {
          organizationId: schedule.organization_id,
          template: schedule.template_id as CreateReportSchedulePayload["template"],
          siteId: schedule.site_id,
          format: schedule.format as CreateReportSchedulePayload["format"],
          dateRange: defaultDateRange(),
        },
        userId,
      );
      reportIds.push(result.id);

      const nextRunAt = computeNextRunAt(
        schedule.cadence as ReportCadence,
        schedule.timezone,
        schedule.day_of_week,
        schedule.day_of_month,
        now,
      );

      await db
        .update(report_schedules)
        .set({
          last_run_at: now,
          next_run_at: nextRunAt,
          updated_at: new Date(),
        })
        .where(eq(report_schedules.id, schedule.id));
    } catch {
      // Continue processing remaining schedules
    }
  }

  return { processed: reportIds.length, reportIds };
}
