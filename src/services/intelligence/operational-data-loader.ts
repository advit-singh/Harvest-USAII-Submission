import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  attendance_records,
  events,
  inventory_lots,
  purchases,
  waste_events,
} from "@/db/schema";
import type { OperationalSnapshot } from "./intelligence-types";

export interface LoadOperationalDataInput {
  organizationId: string;
  siteId: string;
  windowDays?: number;
}

export async function loadOperationalSnapshot(
  input: LoadOperationalDataInput,
): Promise<OperationalSnapshot> {
  const windowDays = input.windowDays ?? 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - windowDays);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + windowDays);

  const [wasteRows, attendanceRows, expiringLots, upcomingEvents, purchaseRows, inventoryAgg] =
    await Promise.all([
      db
        .select({
          quantity: waste_events.quantity,
          wasteDate: waste_events.waste_date,
        })
        .from(waste_events)
        .where(
          and(
            eq(waste_events.organization_id, input.organizationId),
            eq(waste_events.site_id, input.siteId),
            gte(waste_events.waste_date, startDate),
          ),
        )
        .orderBy(desc(waste_events.waste_date)),
      db
        .select({
          count: attendance_records.attendance_count,
          date: attendance_records.attendance_date,
        })
        .from(attendance_records)
        .where(
          and(
            eq(attendance_records.organization_id, input.organizationId),
            eq(attendance_records.site_id, input.siteId),
            gte(attendance_records.attendance_date, startDate),
          ),
        )
        .orderBy(desc(attendance_records.attendance_date)),
      db
        .select({ id: inventory_lots.id })
        .from(inventory_lots)
        .where(
          and(
            eq(inventory_lots.site_id, input.siteId),
            lte(inventory_lots.expiration_date, endDate),
            gte(inventory_lots.expiration_date, new Date()),
          ),
        ),
      db
        .select({
          name: events.name,
          expectedAttendance: events.expected_attendance,
          startDate: events.start_date,
        })
        .from(events)
        .where(
          and(
            eq(events.organization_id, input.organizationId),
            eq(events.site_id, input.siteId),
            gte(events.start_date, new Date()),
            lte(events.start_date, endDate),
          ),
        ),
      db
        .select({ total: purchases.total_cost })
        .from(purchases)
        .where(
          and(
            eq(purchases.organization_id, input.organizationId),
            eq(purchases.site_id, input.siteId),
            gte(purchases.purchase_date, startDate),
          ),
        ),
      db
        .select({
          total: sql<string>`coalesce(sum(${inventory_lots.remaining_quantity}), 0)`,
        })
        .from(inventory_lots)
        .where(eq(inventory_lots.site_id, input.siteId)),
    ]);

  const wasteMeals = wasteRows.map((row) => Number(row.quantity));
  const attendance = attendanceRows.map((row) => row.count);
  const purchaseSpend = purchaseRows.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const inventoryUnits = Number(inventoryAgg[0]?.total ?? 0);

  const avgWastePerDay = average(wasteMeals) || 0;
  const avgAttendance = average(attendance) || 0;
  const wasteTrend = percentChange(firstHalf(wasteMeals), secondHalf(wasteMeals));
  const attendanceTrend = percentChange(firstHalf(attendance), secondHalf(attendance));

  return {
    organizationId: input.organizationId,
    siteId: input.siteId,
    windowDays,
    wasteMeals,
    attendance,
    expirationRiskItems: expiringLots.length,
    upcomingEvents: upcomingEvents.map((event) => ({
      name: event.name,
      expectedAttendance: event.expectedAttendance,
      startDate: event.startDate,
    })),
    inventoryUnits,
    purchaseSpend,
    avgWastePerDay,
    avgAttendance,
    wasteTrend,
    attendanceTrend,
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function firstHalf(values: number[]): number {
  if (values.length === 0) return 0;
  const half = values.slice(0, Math.ceil(values.length / 2));
  return average(half);
}

function secondHalf(values: number[]): number {
  if (values.length === 0) return 0;
  const half = values.slice(Math.floor(values.length / 2));
  return average(half);
}

function percentChange(older: number, newer: number): number {
  if (older === 0) return newer > 0 ? 100 : 0;
  return ((newer - older) / older) * 100;
}
