import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  donation_events,
  donation_matches,
  donation_opportunities,
} from "@/db/schema";
import type {
  DismissDonationResult,
  DonationCompletionPayload,
  DonationCompletionResult,
  DonationMatchResult,
  DonationOpportunity,
  DonationRecord,
} from "@/types/donation";
import { computeImpactDelta, quantityToKg } from "@/services/impact/impact-formulas";
import { recordImpactDelta } from "@/services/impact/impact-service";
import { rankRecipients } from "./donation-matching-engine";
import {
  buildMatchResult,
  mapDonationRecord,
  mapOpportunityFromLot,
} from "./donation-mappers";
import {
  countRecipients,
  getOpportunityContext,
  listOpportunityContexts,
} from "./donation-opportunity-service";
import { getRecipientById, loadRecipientContexts } from "./recipient-service";
import type { ListDonationHistoryInput } from "./donation-types";

export async function listDonationOpportunities(
  organizationId: string,
  siteId?: string,
  status = "open",
): Promise<DonationOpportunity[]> {
  const [contexts, recipientCount] = await Promise.all([
    listOpportunityContexts(organizationId, siteId, status),
    countRecipients(organizationId),
  ]);

  return contexts.map(({ row, lot }) =>
    mapOpportunityFromLot(row, lot, Math.max(1, recipientCount)),
  );
}

export async function getDonationOpportunityById(
  id: string,
  organizationId: string,
): Promise<DonationOpportunity | null> {
  const context = await getOpportunityContext(id, organizationId);
  if (!context) return null;
  const recipientCount = await countRecipients(organizationId);
  return mapOpportunityFromLot(context.row, context.lot, Math.max(1, recipientCount));
}

export async function matchDonationOpportunity(
  opportunityId: string,
  organizationId: string,
  userId?: string,
): Promise<DonationMatchResult | null> {
  const context = await getOpportunityContext(opportunityId, organizationId);
  if (!context) return null;

  const recipients = await loadRecipientContexts(organizationId);
  const quantity =
    Number.parseFloat(context.row.predicted_surplus_quantity ?? "0") ||
    context.lot.remainingQuantity;

  const candidates = rankRecipients(
    {
      opportunityId,
      itemName: context.lot.itemName,
      unit: context.lot.unit,
      quantity,
      expirationDate: context.lot.expirationDate,
      priorityScore: context.row.priority_score,
      siteLatitude: context.lot.siteLatitude,
      siteLongitude: context.lot.siteLongitude,
    },
    recipients,
  );

  await db.delete(donation_matches).where(eq(donation_matches.opportunity_id, opportunityId));

  for (const candidate of candidates) {
    await db.insert(donation_matches).values({
      opportunity_id: opportunityId,
      recipient_id: candidate.recipientId,
      match_score: candidate.matchScore,
      distance: String(candidate.distanceKm),
      reasoning: candidate.reasoning,
      created_by: userId,
    });
  }

  await db
    .update(donation_opportunities)
    .set({ status: "matched", updated_at: new Date() })
    .where(eq(donation_opportunities.id, opportunityId));

  return buildMatchResult(opportunityId, candidates);
}

export async function completeDonation(
  opportunityId: string,
  organizationId: string,
  payload: DonationCompletionPayload,
  userId?: string,
): Promise<DonationCompletionResult | null> {
  if (!payload.confirmedByUser) {
    throw new Error("Human confirmation required to complete donation");
  }

  const context = await getOpportunityContext(opportunityId, organizationId);
  if (!context) return null;

  if (context.row.status === "completed" || context.row.status === "dismissed") {
    throw new Error("Opportunity is no longer actionable");
  }

  const recipient = await getRecipientById(payload.recipientId, organizationId);
  if (!recipient) throw new Error("Recipient not found");

  const quantity =
    Number.parseFloat(context.row.predicted_surplus_quantity ?? "0") ||
    context.lot.remainingQuantity;
  const foodKg = quantityToKg(quantity, context.lot.unit);
  const impactDelta = computeImpactDelta({ quantityKg: foodKg });

  const [event] = await db
    .insert(donation_events)
    .values({
      organization_id: organizationId,
      recipient_id: payload.recipientId,
      site_id: context.lot.siteId,
      completed_at: new Date(),
      total_quantity: String(foodKg),
      estimated_meals: impactDelta.mealsSaved,
      created_by: userId,
    })
    .returning();

  await db
    .update(donation_opportunities)
    .set({ status: "completed", updated_at: new Date() })
    .where(eq(donation_opportunities.id, opportunityId));

  await recordImpactDelta({
    organizationId,
    delta: impactDelta,
    createdBy: userId,
  });

  const donation = mapDonationRecord(
    event!,
    opportunityId,
    context.lot.itemName,
    `${quantity} ${context.lot.unit}`,
    recipient.name,
    context.lot.siteName,
  );

  return { donation, impactDelta };
}

export async function dismissDonationOpportunity(
  opportunityId: string,
  organizationId: string,
  reason?: string,
): Promise<DismissDonationResult | null> {
  const context = await getOpportunityContext(opportunityId, organizationId);
  if (!context) return null;

  await db
    .update(donation_opportunities)
    .set({
      status: "dismissed",
      reason: reason ?? context.row.reason,
      updated_at: new Date(),
    })
    .where(eq(donation_opportunities.id, opportunityId));

  return { id: opportunityId, status: "dismissed" };
}

export async function listDonationHistory(
  input: ListDonationHistoryInput,
): Promise<DonationRecord[]> {
  const completedOpps = await db
    .select()
    .from(donation_opportunities)
    .where(
      and(
        eq(donation_opportunities.organization_id, input.organizationId),
        eq(donation_opportunities.status, "completed"),
      ),
    )
    .orderBy(desc(donation_opportunities.updated_at))
    .limit(50);

  const records: DonationRecord[] = [];

  for (const opp of completedOpps) {
    if (!opp.inventory_lot_id) continue;
    const context = await getOpportunityContext(opp.id, input.organizationId);
    if (!context) continue;
    if (input.siteId && context.lot.siteId !== input.siteId) continue;

    const event = await db.query.donation_events.findFirst({
      where: (fields, { and: andFn, eq: eqFn }) =>
        andFn(
          eqFn(fields.organization_id, input.organizationId),
          eqFn(fields.site_id, context.lot.siteId),
        ),
      orderBy: (fields, { desc: descFn }) => [descFn(fields.completed_at)],
    });

    if (!event) continue;

    const recipient = await db.query.donation_recipients.findFirst({
      where: (fields, { eq: eqFn }) => eqFn(fields.id, event.recipient_id),
    });

    records.push(
      mapDonationRecord(
        event,
        opp.id,
        context.lot.itemName,
        `${context.row.predicted_surplus_quantity ?? context.lot.remainingQuantity} ${context.lot.unit}`,
        recipient?.name ?? "Unknown Recipient",
        context.lot.siteName,
        input.status === "failed" ? "failed" : "completed",
      ),
    );
  }

  return records;
}
