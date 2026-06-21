import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { donation_recipients } from "@/db/schema";
import type { Recipient } from "@/types/recipient";
import { mapRecipient } from "./donation-mappers";
import type { CreateRecipientInput } from "./donation-types";

const DEFAULT_SITE_LAT = 40.7128;
const DEFAULT_SITE_LNG = -74.006;

export async function listRecipients(organizationId: string): Promise<Recipient[]> {
  const rows = await db
    .select()
    .from(donation_recipients)
    .where(eq(donation_recipients.organization_id, organizationId))
    .orderBy(donation_recipients.name);

  return rows.map((row) => mapRecipient(row));
}

export async function createRecipient(input: CreateRecipientInput): Promise<Recipient> {
  const capacityRating = Math.min(5, Math.max(1, Math.ceil(input.capacityMeals / 100)));

  const offsetLat = (input.distanceKm / 111) * 0.3;
  const offsetLng = (input.distanceKm / 111) * 0.5;

  const [row] = await db
    .insert(donation_recipients)
    .values({
      organization_id: input.organizationId,
      name: input.name,
      recipient_type: input.type,
      address: input.address,
      contact_name: input.name,
      phone: input.contactPhone,
      email: input.contactEmail,
      capacity_rating: capacityRating,
      latitude: String(DEFAULT_SITE_LAT + offsetLat),
      longitude: String(DEFAULT_SITE_LNG + offsetLng),
      created_by: input.createdBy,
    })
    .returning();

  return mapRecipient(row!, input.distanceKm);
}

export async function getRecipientById(id: string, organizationId: string) {
  const row = await db.query.donation_recipients.findFirst({
    where: (fields, { and: andFn, eq: eqFn }) =>
      andFn(eqFn(fields.id, id), eqFn(fields.organization_id, organizationId)),
  });
  return row ? mapRecipient(row) : null;
}

export async function loadRecipientContexts(organizationId: string) {
  return db
    .select({
      id: donation_recipients.id,
      name: donation_recipients.name,
      recipientType: donation_recipients.recipient_type,
      latitude: donation_recipients.latitude,
      longitude: donation_recipients.longitude,
      capacityRating: donation_recipients.capacity_rating,
    })
    .from(donation_recipients)
    .where(eq(donation_recipients.organization_id, organizationId));
}
