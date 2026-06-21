import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { attendance_records } from "@/db/schema";

export interface AttendanceFilters {
  organizationId: string;
  siteId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AttendanceRecordDto {
  id: string;
  organizationId: string;
  siteId: string;
  attendanceDate: string;
  attendanceCount: number;
  source: string;
}

export async function listAttendanceRecords(
  filters: AttendanceFilters,
): Promise<AttendanceRecordDto[]> {
  const conditions = [eq(attendance_records.organization_id, filters.organizationId)];
  if (filters.siteId) {
    conditions.push(eq(attendance_records.site_id, filters.siteId));
  }
  if (filters.startDate) {
    conditions.push(gte(attendance_records.attendance_date, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(attendance_records.attendance_date, filters.endDate));
  }

  const rows = await db
    .select()
    .from(attendance_records)
    .where(and(...conditions))
    .orderBy(attendance_records.attendance_date);

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organization_id,
    siteId: row.site_id,
    attendanceDate: row.attendance_date.toISOString(),
    attendanceCount: row.attendance_count,
    source: row.source,
  }));
}
