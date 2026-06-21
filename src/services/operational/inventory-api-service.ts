import { and, eq, ilike, lte } from "drizzle-orm";
import { db } from "@/db/client";
import {
  inventory_categories,
  inventory_items,
  inventory_lots,
} from "@/db/schema";

export interface InventoryListFilters {
  organizationId: string;
  siteId?: string;
  categoryId?: string;
  search?: string;
  expiringSoon?: boolean;
}

export interface InventoryItemDto {
  id: string;
  organizationId: string;
  siteId: string;
  categoryId: string | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  unitType: string | null;
  defaultCost: string | null;
  totalQuantity: string;
  expiringLots: number;
}

export interface InventoryLotDto {
  id: string;
  inventoryItemId: string;
  itemName: string;
  siteId: string;
  quantity: string;
  remainingQuantity: string;
  unit: string;
  expirationDate: string | null;
  storageLocation: string | null;
}

export async function listInventoryItems(
  filters: InventoryListFilters,
): Promise<InventoryItemDto[]> {
  const conditions = [eq(inventory_items.organization_id, filters.organizationId)];
  if (filters.siteId) {
    conditions.push(eq(inventory_items.site_id, filters.siteId));
  }
  if (filters.categoryId) {
    conditions.push(eq(inventory_items.category_id, filters.categoryId));
  }
  if (filters.search) {
    conditions.push(ilike(inventory_items.name, `%${filters.search}%`));
  }

  const rows = await db
    .select({
      item: inventory_items,
      categoryName: inventory_categories.name,
    })
    .from(inventory_items)
    .leftJoin(inventory_categories, eq(inventory_items.category_id, inventory_categories.id))
    .where(and(...conditions))
    .orderBy(inventory_items.name);

  const lots = await db.select().from(inventory_lots);
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);

  const result: InventoryItemDto[] = [];

  for (const row of rows) {
    const itemLots = lots.filter((lot) => lot.inventory_item_id === row.item.id);
    const totalQuantity = itemLots.reduce(
      (sum, lot) => sum + Number(lot.remaining_quantity),
      0,
    );
    const expiringLots = itemLots.filter(
      (lot) => lot.expiration_date && lot.expiration_date <= soon,
    ).length;

    if (filters.expiringSoon && expiringLots === 0) {
      continue;
    }

    result.push({
      id: row.item.id,
      organizationId: row.item.organization_id,
      siteId: row.item.site_id,
      categoryId: row.item.category_id,
      categoryName: row.categoryName,
      name: row.item.name,
      description: row.item.description,
      unitType: row.item.unit_type,
      defaultCost: row.item.default_cost,
      totalQuantity: String(totalQuantity),
      expiringLots,
    });
  }

  return result;
}

export async function getInventoryItemById(id: string, organizationId: string) {
  const row = await db.query.inventory_items.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, id), eqFn(fields.organization_id, organizationId)),
  });
  if (!row) return null;

  const category = row.category_id
    ? await db.query.inventory_categories.findFirst({
        where: (fields, { eq: eqFn }) => eqFn(fields.id, row.category_id!),
      })
    : null;

  const lots = await db
    .select()
    .from(inventory_lots)
    .where(eq(inventory_lots.inventory_item_id, id));

  const totalQuantity = lots.reduce((sum, lot) => sum + Number(lot.remaining_quantity), 0);
  const soon = new Date();
  soon.setDate(soon.getDate() + 7);
  const expiringLots = lots.filter(
    (lot) => lot.expiration_date && lot.expiration_date <= soon,
  ).length;

  return {
    id: row.id,
    organizationId: row.organization_id,
    siteId: row.site_id,
    categoryId: row.category_id,
    categoryName: category?.name ?? null,
    name: row.name,
    description: row.description,
    unitType: row.unit_type,
    defaultCost: row.default_cost,
    totalQuantity: String(totalQuantity),
    expiringLots,
  } satisfies InventoryItemDto;
}

export async function updateInventoryItem(
  id: string,
  organizationId: string,
  patch: { name?: string; description?: string; defaultCost?: string },
) {
  const [row] = await db
    .update(inventory_items)
    .set({
      name: patch.name,
      description: patch.description,
      default_cost: patch.defaultCost,
      updated_at: new Date(),
    })
    .where(
      and(eq(inventory_items.id, id), eq(inventory_items.organization_id, organizationId)),
    )
    .returning();

  if (!row) return null;
  return getInventoryItemById(id, organizationId);
}

export interface InventoryLotsFilters {
  organizationId: string;
  siteId?: string;
  expiringBefore?: Date;
  minQuantity?: number;
}

export async function listInventoryLots(
  filters: InventoryLotsFilters,
): Promise<InventoryLotDto[]> {
  const items = await db
    .select()
    .from(inventory_items)
    .where(eq(inventory_items.organization_id, filters.organizationId));

  const itemMap = new Map(items.map((item) => [item.id, item]));
  const itemIds = items.map((item) => item.id);
  if (itemIds.length === 0) return [];

  const lotConditions = [];
  if (filters.siteId) {
    lotConditions.push(eq(inventory_lots.site_id, filters.siteId));
  }
  if (filters.expiringBefore) {
    lotConditions.push(lte(inventory_lots.expiration_date, filters.expiringBefore));
  }

  const lots = await db
    .select()
    .from(inventory_lots)
    .where(lotConditions.length > 0 ? and(...lotConditions) : undefined);

  return lots
    .filter((lot) => itemMap.has(lot.inventory_item_id))
    .filter((lot) =>
      filters.minQuantity ? Number(lot.remaining_quantity) >= filters.minQuantity : true,
    )
    .map((lot) => {
      const item = itemMap.get(lot.inventory_item_id)!;
      return {
        id: lot.id,
        inventoryItemId: lot.inventory_item_id,
        itemName: item.name,
        siteId: lot.site_id,
        quantity: lot.quantity,
        remainingQuantity: lot.remaining_quantity,
        unit: lot.unit,
        expirationDate: lot.expiration_date?.toISOString() ?? null,
        storageLocation: lot.storage_location,
      };
    });
}
