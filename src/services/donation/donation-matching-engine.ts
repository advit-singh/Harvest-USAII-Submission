import { distanceKm, parseCoordinate, type GeoPoint } from "@/lib/geo/distance";
import type { DonationMatchCandidate, DonationMatchFactor } from "@/types/donation";
import type { MatchOpportunityContext, MatchRecipientContext } from "./donation-types";

const WEIGHTS = {
  distance: 0.25,
  capacity: 0.2,
  compatibility: 0.25,
  urgency: 0.2,
  availability: 0.1,
} as const;

function sitePoint(ctx: MatchOpportunityContext): GeoPoint | null {
  const lat = parseCoordinate(ctx.siteLatitude);
  const lng = parseCoordinate(ctx.siteLongitude);
  if (lat == null || lng == null) return null;
  return { latitude: lat, longitude: lng };
}

function recipientPoint(r: MatchRecipientContext): GeoPoint | null {
  const lat = parseCoordinate(r.latitude);
  const lng = parseCoordinate(r.longitude);
  if (lat == null || lng == null) return null;
  return { latitude: lat, longitude: lng };
}

function distanceScore(km: number): number {
  if (km <= 2) return 100;
  if (km <= 5) return 85;
  if (km <= 10) return 65;
  if (km <= 20) return 45;
  return 25;
}

function capacityScore(rating: number | null, quantity: number): number {
  const capacity = (rating ?? 3) * 25;
  if (quantity <= capacity) return 95;
  if (quantity <= capacity * 1.5) return 70;
  return 40;
}

function compatibilityScore(itemName: string, recipientType: string): number {
  const item = itemName.toLowerCase();
  if (recipientType === "food_bank") return 90;
  if (recipientType === "community_kitchen" && (item.includes("milk") || item.includes("bread"))) {
    return 88;
  }
  if (recipientType === "shelter" && item.includes("prepared")) return 85;
  if (item.includes("produce") || item.includes("apple") || item.includes("vegetable")) return 82;
  return 70;
}

function urgencyScore(expirationDate: Date, priorityScore: number): number {
  const hoursLeft = (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60);
  let score = priorityScore;
  if (hoursLeft < 24) score = Math.min(100, score + 20);
  else if (hoursLeft < 72) score = Math.min(100, score + 10);
  return Math.max(30, score);
}

function availabilityScore(recipientType: string): number {
  switch (recipientType) {
    case "community_kitchen":
      return 90;
    case "food_bank":
      return 85;
    case "shelter":
      return 75;
    default:
      return 70;
  }
}

function buildReasoning(factors: DonationMatchFactor[], score: number): string {
  const top = [...factors].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0)).slice(0, 2);
  const parts = top.map((f) => `${f.label}: ${f.value}`);
  return `Match score ${score} based on ${parts.join("; ")}.`;
}

export function rankRecipients(
  opportunity: MatchOpportunityContext,
  recipients: MatchRecipientContext[],
): DonationMatchCandidate[] {
  const origin = sitePoint(opportunity);

  const scored = recipients.map((recipient) => {
    const dest = recipientPoint(recipient);
    const km = distanceKm(origin, dest, 5);

    const distance = distanceScore(km);
    const capacity = capacityScore(recipient.capacityRating, opportunity.quantity);
    const compatibility = compatibilityScore(opportunity.itemName, recipient.recipientType);
    const urgency = urgencyScore(opportunity.expirationDate, opportunity.priorityScore);
    const availability = availabilityScore(recipient.recipientType);

    const factors: DonationMatchFactor[] = [
      { label: "Distance", value: `${km} km`, weight: WEIGHTS.distance },
      { label: "Capacity fit", value: `${capacity}/100`, weight: WEIGHTS.capacity },
      { label: "Food compatibility", value: `${compatibility}/100`, weight: WEIGHTS.compatibility },
      { label: "Urgency", value: `${urgency}/100`, weight: WEIGHTS.urgency },
      { label: "Availability", value: `${availability}/100`, weight: WEIGHTS.availability },
    ];

    const matchScore = Math.round(
      distance * WEIGHTS.distance +
        capacity * WEIGHTS.capacity +
        compatibility * WEIGHTS.compatibility +
        urgency * WEIGHTS.urgency +
        availability * WEIGHTS.availability,
    );

    const confidence = Math.min(0.98, 0.55 + matchScore / 200);

    return {
      recipientId: recipient.id,
      recipientName: recipient.name,
      matchScore,
      distanceKm: km,
      reasoning: buildReasoning(factors, matchScore),
      pickupAvailability: "Within 4 hours",
      compatibility:
        compatibility >= 85 ? "High" : compatibility >= 70 ? "Moderate" : "Limited",
      factors,
      confidence: Math.round(confidence * 100) / 100,
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
