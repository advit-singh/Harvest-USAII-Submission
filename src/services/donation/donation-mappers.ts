import type {
  DonationMatchCandidate,
  DonationMatchFactor,
  DonationMatchResult,
  DonationOpportunity,
  DonationPriority,
  DonationRecord,
} from "@/types/donation";
import type { Recipient } from "@/types/recipient";
import type { OpportunityLotContext } from "./donation-types";
import { mealsFromQuantity } from "@/services/impact/impact-formulas";

type OpportunityRow = {
  id: string;
  organization_id: string;
  inventory_lot_id: string | null;
  priority_score: number;
  reason: string | null;
  predicted_surplus_quantity: string | null;
  status: string;
  created_at: Date;
};

type EventRow = {
  id: string;
  organization_id: string;
  recipient_id: string;
  site_id: string;
  completed_at: Date;
  total_quantity: string | null;
  estimated_meals: number | null;
};

function priorityFromScore(score: number): DonationPriority {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function formatQuantity(quantity: number, unit: string): string {
  const rounded = Math.round(quantity * 10) / 10;
  return `${rounded} ${unit}`;
}

export function mapOpportunityFromLot(
  row: OpportunityRow,
  lot: OpportunityLotContext,
  recipientCount: number,
): DonationOpportunity {
  const quantity = Number.parseFloat(row.predicted_surplus_quantity ?? String(lot.remainingQuantity));
  const priorityScore = row.priority_score;
  return {
    id: row.id,
    item: lot.itemName,
    quantity: formatQuantity(quantity, lot.unit),
    expirationDate: lot.expirationDate.toISOString(),
    suggestedRecipientCount: recipientCount,
    priority: priorityFromScore(priorityScore),
    priorityScore,
    predictedMealsSaved: mealsFromQuantity(quantity, lot.unit),
    status: row.status as DonationOpportunity["status"],
    siteName: lot.siteName,
    siteId: lot.siteId,
    createdAt: row.created_at.toISOString(),
  };
}

export function mapRecipient(row: {
  id: string;
  organization_id: string;
  name: string;
  recipient_type: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  capacity_rating: number | null;
}, distanceKm = 5): Recipient {
  const capacity = row.capacity_rating ?? 50;
  return {
    id: row.id,
    name: row.name,
    type: row.recipient_type as Recipient["type"],
    distanceKm,
    capacityMeals: capacity * 25,
    foodTypesAccepted: defaultFoodTypes(row.recipient_type),
    availability: "Weekdays",
    operatingHours: "Mon–Fri 8:00–18:00",
    contactEmail: row.email ?? undefined,
    contactPhone: row.phone ?? undefined,
    address: row.address ?? undefined,
    organizationId: row.organization_id,
  };
}

function defaultFoodTypes(recipientType: string): string[] {
  switch (recipientType) {
    case "food_bank":
      return ["produce", "dairy", "bread", "canned"];
    case "shelter":
      return ["prepared", "bread", "produce"];
    case "community_kitchen":
      return ["produce", "dairy", "bread", "prepared"];
    default:
      return ["produce", "dairy", "bread"];
  }
}

export function mapDonationRecord(
  event: EventRow,
  opportunityId: string,
  item: string,
  quantity: string,
  recipientName: string,
  siteName: string,
  status: DonationRecord["status"] = "completed",
  failureReason?: string,
): DonationRecord {
  return {
    id: event.id,
    opportunityId,
    item,
    quantity,
    recipientName,
    recipientId: event.recipient_id,
    status,
    mealsRescued: event.estimated_meals ?? 0,
    completedAt: event.completed_at.toISOString(),
    siteName,
    failureReason,
  };
}

export function buildMatchResult(
  opportunityId: string,
  candidates: DonationMatchCandidate[],
): DonationMatchResult {
  return {
    opportunityId,
    candidates,
    generatedAt: new Date().toISOString(),
  };
}

export function buildMatchFactors(factors: DonationMatchFactor[]): DonationMatchFactor[] {
  return factors;
}
