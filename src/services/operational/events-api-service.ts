import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { events } from "@/db/schema";

export interface EventDto {
  id: string;
  organizationId: string;
  siteId: string;
  name: string;
  eventType: string;
  startDate: string;
  endDate: string | null;
  expectedAttendance: number | null;
}

export interface CreateEventInput {
  organizationId: string;
  siteId: string;
  name: string;
  eventType: string;
  startDate: Date;
  endDate?: Date;
  expectedAttendance?: number;
  createdBy: string;
}

export async function listEvents(organizationId: string, siteId?: string): Promise<EventDto[]> {
  const conditions = [eq(events.organization_id, organizationId)];
  if (siteId) {
    conditions.push(eq(events.site_id, siteId));
  }

  const rows = await db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(events.start_date);

  return rows.map(mapEvent);
}

export async function createEvent(input: CreateEventInput): Promise<EventDto> {
  const [row] = await db
    .insert(events)
    .values({
      organization_id: input.organizationId,
      site_id: input.siteId,
      name: input.name,
      event_type: input.eventType,
      start_date: input.startDate,
      end_date: input.endDate ?? null,
      expected_attendance: input.expectedAttendance ?? null,
      created_by: input.createdBy,
    })
    .returning();

  return mapEvent(row!);
}

export async function updateEvent(
  id: string,
  organizationId: string,
  patch: Partial<{
    name: string;
    eventType: string;
    startDate: Date;
    endDate: Date | null;
    expectedAttendance: number | null;
  }>,
): Promise<EventDto | null> {
  const [row] = await db
    .update(events)
    .set({
      name: patch.name,
      event_type: patch.eventType,
      start_date: patch.startDate,
      end_date: patch.endDate,
      expected_attendance: patch.expectedAttendance,
      updated_at: new Date(),
    })
    .where(and(eq(events.id, id), eq(events.organization_id, organizationId)))
    .returning();

  return row ? mapEvent(row) : null;
}

function mapEvent(row: typeof events.$inferSelect): EventDto {
  return {
    id: row.id,
    organizationId: row.organization_id,
    siteId: row.site_id,
    name: row.name,
    eventType: row.event_type,
    startDate: row.start_date.toISOString(),
    endDate: row.end_date?.toISOString() ?? null,
    expectedAttendance: row.expected_attendance,
  };
}
