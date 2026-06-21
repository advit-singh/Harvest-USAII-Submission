import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { waste_events } from "@/db/schema";

export interface WasteRecordDto {
  id: string;
  organizationId: string;
  siteId: string;
  inventoryItemId: string | null;
  quantity: string;
  unit: string;
  wasteReason: string;
  wasteDate: string;
}

export interface CreateWasteInput {
  organizationId: string;
  siteId: string;
  inventoryItemId?: string;
  quantity: string;
  unit: string;
  wasteReason: string;
  wasteDate: Date;
  createdBy: string;
}

export interface WasteFilters {
  organizationId: string;
  siteId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function listWasteRecords(filters: WasteFilters): Promise<WasteRecordDto[]> {
  const conditions = [eq(waste_events.organization_id, filters.organizationId)];
  if (filters.siteId) {
    conditions.push(eq(waste_events.site_id, filters.siteId));
  }
  if (filters.startDate) {
    conditions.push(gte(waste_events.waste_date, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(waste_events.waste_date, filters.endDate));
  }

  const rows = await db
    .select()
    .from(waste_events)
    .where(and(...conditions))
    .orderBy(waste_events.waste_date);

  return rows.map(mapWaste);
}

export async function createWasteRecord(input: CreateWasteInput): Promise<WasteRecordDto> {
  const [row] = await db
    .insert(waste_events)
    .values({
      organization_id: input.organizationId,
      site_id: input.siteId,
      inventory_item_id: input.inventoryItemId ?? null,
      quantity: input.quantity,
      unit: input.unit,
      waste_reason: input.wasteReason,
      waste_date: input.wasteDate,
      created_by: input.createdBy,
    })
    .returning();

  return mapWaste(row!);
}

function mapWaste(row: typeof waste_events.$inferSelect): WasteRecordDto {
  return {
    id: row.id,
    organizationId: row.organization_id,
    siteId: row.site_id,
    inventoryItemId: row.inventory_item_id,
    quantity: row.quantity,
    unit: row.unit,
    wasteReason: row.waste_reason,
    wasteDate: row.waste_date.toISOString(),
  };
}
