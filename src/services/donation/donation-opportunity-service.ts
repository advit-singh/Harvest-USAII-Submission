import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  donation_opportunities,
  donation_recipients,
  inventory_items,
  inventory_lots,
  organization_sites,
} from "@/db/schema";
import type { OpportunityLotContext, SyncOpportunitiesInput } from "./donation-types";

const DEFAULT_EXPIRATION_WINDOW_DAYS = 7;

export async function syncDonationOpportunities(
  input: SyncOpportunitiesInput,
): Promise<number> {
  const windowDays = input.expirationWindowDays ?? DEFAULT_EXPIRATION_WINDOW_DAYS;
  const now = new Date();
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + windowDays);

  const lots = await loadExpiringLots(input.organizationId, input.siteId, now, windowEnd);
  let created = 0;

  for (const lot of lots) {
    const existing = await db.query.donation_opportunities.findFirst({
      where: (fields, { and: andFn, eq: eqFn, inArray: inArrayFn }) =>
        andFn(
          eqFn(fields.inventory_lot_id, lot.lotId),
          inArrayFn(fields.status, ["open", "matched"]),
        ),
    });

    if (existing) continue;

    const surplusBoost = await getSurplusForecastBoost(input.organizationId, input.siteId);
    const daysToExpiry = Math.max(
      1,
      (lot.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    const urgencyScore = Math.min(100, Math.round(100 - daysToExpiry * 8) + surplusBoost);

    await db.insert(donation_opportunities).values({
      organization_id: input.organizationId,
      inventory_lot_id: lot.lotId,
      priority_score: urgencyScore,
      reason: `Expiring ${lot.itemName} within ${Math.ceil(daysToExpiry)} days`,
      predicted_surplus_quantity: String(lot.remainingQuantity),
      status: "open",
      created_by: input.createdBy,
    });
    created += 1;
  }

  return created;
}

export async function listOpportunityContexts(
  organizationId: string,
  siteId?: string,
  status = "open",
) {
  const conditions = [eq(donation_opportunities.organization_id, organizationId)];
  if (status !== "all") {
    conditions.push(eq(donation_opportunities.status, status));
  }

  const rows = await db
    .select()
    .from(donation_opportunities)
    .where(and(...conditions))
    .orderBy(sql`${donation_opportunities.priority_score} DESC`)
    .limit(50);

  const contexts: Array<{
    row: (typeof rows)[number];
    lot: OpportunityLotContext;
  }> = [];

  for (const row of rows) {
    if (!row.inventory_lot_id) continue;
    const lot = await loadLotContext(row.inventory_lot_id);
    if (!lot) continue;
    if (siteId && lot.siteId !== siteId) continue;
    contexts.push({ row, lot });
  }

  return contexts;
}

export async function getOpportunityContext(opportunityId: string, organizationId: string) {
  const row = await db.query.donation_opportunities.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, opportunityId), eqFn(fields.organization_id, organizationId)),
  });
  if (!row?.inventory_lot_id) return null;

  const lot = await loadLotContext(row.inventory_lot_id);
  if (!lot) return null;

  return { row, lot };
}

async function loadExpiringLots(
  organizationId: string,
  siteId: string,
  start: Date,
  end: Date,
): Promise<OpportunityLotContext[]> {
  const rows = await db
    .select({
      lotId: inventory_lots.id,
      siteId: inventory_lots.site_id,
      remainingQuantity: inventory_lots.remaining_quantity,
      unit: inventory_lots.unit,
      expirationDate: inventory_lots.expiration_date,
      itemName: inventory_items.name,
      siteName: organization_sites.name,
      siteLatitude: organization_sites.latitude,
      siteLongitude: organization_sites.longitude,
    })
    .from(inventory_lots)
    .innerJoin(inventory_items, eq(inventory_lots.inventory_item_id, inventory_items.id))
    .innerJoin(organization_sites, eq(inventory_lots.site_id, organization_sites.id))
    .where(
      and(
        eq(organization_sites.organization_id, organizationId),
        eq(inventory_lots.site_id, siteId),
        gte(inventory_lots.expiration_date, start),
        lte(inventory_lots.expiration_date, end),
        sql`${inventory_lots.remaining_quantity}::numeric > 0`,
      ),
    );

  return rows
    .filter((r) => r.expirationDate)
    .map((r) => ({
      lotId: r.lotId,
      siteId: r.siteId,
      itemName: r.itemName,
      unit: r.unit,
      remainingQuantity: Number.parseFloat(r.remainingQuantity) || 0,
      expirationDate: r.expirationDate!,
      siteName: r.siteName,
      siteLatitude: r.siteLatitude,
      siteLongitude: r.siteLongitude,
    }));
}

async function loadLotContext(lotId: string): Promise<OpportunityLotContext | null> {
  const rows = await db
    .select({
      lotId: inventory_lots.id,
      siteId: inventory_lots.site_id,
      remainingQuantity: inventory_lots.remaining_quantity,
      unit: inventory_lots.unit,
      expirationDate: inventory_lots.expiration_date,
      itemName: inventory_items.name,
      siteName: organization_sites.name,
      siteLatitude: organization_sites.latitude,
      siteLongitude: organization_sites.longitude,
    })
    .from(inventory_lots)
    .innerJoin(inventory_items, eq(inventory_lots.inventory_item_id, inventory_items.id))
    .innerJoin(organization_sites, eq(inventory_lots.site_id, organization_sites.id))
    .where(eq(inventory_lots.id, lotId))
    .limit(1);

  const r = rows[0];
  if (!r?.expirationDate) return null;

  return {
    lotId: r.lotId,
    siteId: r.siteId,
    itemName: r.itemName,
    unit: r.unit,
    remainingQuantity: Number.parseFloat(r.remainingQuantity) || 0,
    expirationDate: r.expirationDate,
    siteName: r.siteName,
    siteLatitude: r.siteLatitude,
    siteLongitude: r.siteLongitude,
  };
}

async function getSurplusForecastBoost(organizationId: string, siteId: string): Promise<number> {
  const row = await db.query.forecasts.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(
        eqFn(fields.organization_id, organizationId),
        eqFn(fields.site_id, siteId),
        eqFn(fields.forecast_type, "surplus"),
      ),
    orderBy: (fields, { desc: descFn }) => [descFn(fields.created_at)],
  });

  if (!row) return 0;
  const value = Number.parseFloat(row.predicted_value) || 0;
  if (value > 100) return 15;
  if (value > 50) return 10;
  return 5;
}

export async function countRecipients(organizationId: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(donation_recipients)
    .where(eq(donation_recipients.organization_id, organizationId));
  return rows[0]?.count ?? 0;
}
