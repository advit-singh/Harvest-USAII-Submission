import type {
  DonationMatchResult,
  DonationOpportunity,
  DonationRecord,
  DonationCompletionResult,
} from "@/types/donation";
import type { Recipient, CreateRecipientPayload } from "@/types/recipient";
import type { DonationHistoryFilters } from "@/types/rescue";

import { patchSiteFieldsList } from "@/lib/demo/apply-org-context";

const DEMO_ORG = "org_demo_123";

const DEMO_SITE_ID = "site_001";

let mockOpportunities: DonationOpportunity[] = [
  {
    id: "don_001",
    item: "Whole milk (1 gal cartons)",
    quantity: "24 units",
    expirationDate: new Date(Date.now() + 172800000).toISOString(),
    suggestedRecipientCount: 3,
    priority: "high",
    priorityScore: 92,
    predictedMealsSaved: 48,
    status: "open",
    siteName: "Main Kitchen",
    siteId: "site_001",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "don_002",
    item: "Fresh apples",
    quantity: "15 kg",
    expirationDate: new Date(Date.now() + 259200000).toISOString(),
    suggestedRecipientCount: 2,
    priority: "medium",
    priorityScore: 68,
    predictedMealsSaved: 35,
    status: "open",
    siteName: "Main Kitchen",
    siteId: "site_001",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "don_003",
    item: "Whole wheat bread loaves",
    quantity: "18 loaves",
    expirationDate: new Date(Date.now() + 86400000).toISOString(),
    suggestedRecipientCount: 4,
    priority: "high",
    priorityScore: 88,
    predictedMealsSaved: 36,
    status: "open",
    siteName: "Main Kitchen",
    siteId: "site_001",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

let mockRecipients: Recipient[] = [
  {
    id: "rec_001",
    name: "Community Kitchen",
    type: "community_kitchen",
    distanceKm: 2.4,
    capacityMeals: 120,
    foodTypesAccepted: ["produce", "dairy", "bread", "prepared"],
    availability: "Weekdays 8am–6pm",
    operatingHours: "Mon–Fri 8:00–18:00",
    contactEmail: "donations@communitykitchen.org",
    contactPhone: "(555) 201-4400",
    address: "142 Oak Street",
    organizationId: DEMO_ORG,
  },
  {
    id: "rec_002",
    name: "Riverside Food Bank",
    type: "food_bank",
    distanceKm: 5.1,
    capacityMeals: 500,
    foodTypesAccepted: ["produce", "dairy", "bread", "canned"],
    availability: "Daily 7am–4pm",
    operatingHours: "Mon–Sun 7:00–16:00",
    contactEmail: "intake@riversidefoodbank.org",
    organizationId: DEMO_ORG,
  },
  {
    id: "rec_003",
    name: "Hope Shelter",
    type: "shelter",
    distanceKm: 3.8,
    capacityMeals: 80,
    foodTypesAccepted: ["prepared", "bread", "produce"],
    availability: "Daily 10am–8pm",
    operatingHours: "Mon–Sun 10:00–20:00",
    organizationId: DEMO_ORG,
  },
  {
    id: "rec_004",
    name: "Lincoln Community Fridge",
    type: "community_fridge",
    distanceKm: 1.2,
    capacityMeals: 30,
    foodTypesAccepted: ["produce", "bread", "dairy"],
    availability: "24/7 self-serve",
    operatingHours: "Always open",
    organizationId: DEMO_ORG,
  },
];

let mockDonationHistory: DonationRecord[] = [
  {
    id: "donation_001",
    opportunityId: "don_prev_001",
    item: "Whole wheat bread loaves",
    quantity: "12 loaves",
    recipientName: "Community Kitchen",
    recipientId: "rec_001",
    status: "completed",
    mealsRescued: 24,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    siteName: "Main Kitchen",
  },
  {
    id: "donation_002",
    opportunityId: "don_prev_002",
    item: "Mixed salad greens",
    quantity: "8 kg",
    recipientName: "Hope Shelter",
    recipientId: "rec_003",
    status: "completed",
    mealsRescued: 18,
    completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    siteName: "Main Kitchen",
  },
  {
    id: "donation_003",
    opportunityId: "don_prev_003",
    item: "Yogurt cups",
    quantity: "40 units",
    recipientName: "Riverside Food Bank",
    recipientId: "rec_002",
    status: "failed",
    mealsRescued: 0,
    completedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    siteName: "Main Kitchen",
    failureReason: "Recipient unavailable — capacity exceeded",
  },
];

const matchResults: Record<string, DonationMatchResult> = {};

function buildMatchResult(opportunityId: string): DonationMatchResult {
  const opp = mockOpportunities.find((o) => o.id === opportunityId);
  const candidates = mockRecipients
    .slice(0, 4)
    .map((r, index) => ({
      recipientId: r.id,
      recipientName: r.name,
      matchScore: 95 - index * 8,
      distanceKm: r.distanceKm,
      reasoning:
        index === 0
          ? "Closest recipient with dairy capacity and weekday pickup window aligns with expiration urgency."
          : `Strong compatibility for ${opp?.item ?? "surplus items"}; ${r.foodTypesAccepted.join(", ")} accepted.`,
      pickupAvailability: r.availability,
      compatibility:
        index === 0 ? "Excellent" : index === 1 ? "Good" : "Fair",
      factors: [
        { label: "Distance", value: `${r.distanceKm} km`, weight: 0.25 },
        { label: "Capacity", value: `${r.capacityMeals} meals`, weight: 0.2 },
        {
          label: "Food type match",
          value: r.foodTypesAccepted.includes("dairy")
            ? "Dairy accepted"
            : "Partial match",
          weight: 0.3,
        },
        {
          label: "Expiration urgency",
          value: opp?.priority === "high" ? "Critical" : "Moderate",
          weight: 0.25,
        },
      ],
      confidence: 0.92 - index * 0.08,
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const result: DonationMatchResult = {
    opportunityId,
    candidates,
    generatedAt: new Date().toISOString(),
  };
  matchResults[opportunityId] = result;
  return result;
}

export function getMockRescueOpportunities(orgId: string = DEMO_ORG): DonationOpportunity[] {
  return patchSiteFieldsList(orgId, mockOpportunities.filter((o) => o.status === "open"));
}

export function getAllMockOpportunities(): DonationOpportunity[] {
  return [...mockOpportunities];
}

export function getMockOpportunityById(
  id: string,
): DonationOpportunity | undefined {
  return mockOpportunities.find((o) => o.id === id);
}

export function getMockDonationMatch(
  opportunityId: string,
): DonationMatchResult {
  if (matchResults[opportunityId]) {
    return matchResults[opportunityId];
  }
  return buildMatchResult(opportunityId);
}

export function dismissMockOpportunity(
  id: string,
): DonationOpportunity | null {
  const index = mockOpportunities.findIndex((o) => o.id === id);
  if (index === -1) return null;
  mockOpportunities[index] = {
    ...mockOpportunities[index],
    status: "dismissed",
  };
  return mockOpportunities[index];
}

export function completeMockDonation(
  opportunityId: string,
  recipientId: string,
): DonationCompletionResult | null {
  const opp = mockOpportunities.find((o) => o.id === opportunityId);
  const recipient = mockRecipients.find((r) => r.id === recipientId);
  if (!opp || !recipient) return null;

  const record: DonationRecord = {
    id: `donation_${Date.now()}`,
    opportunityId,
    item: opp.item,
    quantity: opp.quantity,
    recipientName: recipient.name,
    recipientId,
    status: "completed",
    mealsRescued: opp.predictedMealsSaved,
    completedAt: new Date().toISOString(),
    siteName: opp.siteName,
  };

  mockOpportunities = mockOpportunities.map((o) =>
    o.id === opportunityId ? { ...o, status: "completed" } : o,
  );
  mockDonationHistory = [record, ...mockDonationHistory];

  return {
    donation: record,
    impactDelta: {
      mealsSaved: opp.predictedMealsSaved,
      foodDivertedKg: Math.round(opp.predictedMealsSaved * 0.4),
      moneySaved: Math.round(opp.predictedMealsSaved * 2.5),
      co2AvoidedKg: Math.round(opp.predictedMealsSaved * 0.4),
    },
  };
}

export function recordMockDonationFailure(
  opportunityId: string,
  recipientId: string,
  reason: string,
): DonationRecord | null {
  const opp = mockOpportunities.find((o) => o.id === opportunityId);
  const recipient = mockRecipients.find((r) => r.id === recipientId);
  if (!opp || !recipient) return null;

  const record: DonationRecord = {
    id: `donation_fail_${Date.now()}`,
    opportunityId,
    item: opp.item,
    quantity: opp.quantity,
    recipientName: recipient.name,
    recipientId,
    status: "failed",
    mealsRescued: 0,
    completedAt: new Date().toISOString(),
    siteName: opp.siteName,
    failureReason: reason,
  };

  mockDonationHistory = [record, ...mockDonationHistory];
  return record;
}

export function getMockRecipients(orgId: string): Recipient[] {
  if (orgId.startsWith("org_empty") || orgId === "org_new") {
    return [];
  }
  return [...mockRecipients];
}

export function createMockRecipient(
  orgId: string,
  payload: CreateRecipientPayload,
): Recipient {
  const recipient: Recipient = {
    id: `rec_${Date.now()}`,
    organizationId: orgId,
    ...payload,
  };
  mockRecipients = [...mockRecipients, recipient];
  return recipient;
}

export function getMockDonationHistory(
  orgId: string,
  filters: DonationHistoryFilters,
): DonationRecord[] {
  if (orgId.startsWith("org_empty") || orgId === "org_new") {
    return [];
  }

  let records = [...mockDonationHistory];

  if (filters.status !== "all") {
    records = records.filter((r) => r.status === filters.status);
  }

  return records;
}

export function resetRescueMocks(): void {
  mockOpportunities = [
    {
      id: "don_001",
      item: "Whole milk (1 gal cartons)",
      quantity: "24 units",
      expirationDate: new Date(Date.now() + 172800000).toISOString(),
      suggestedRecipientCount: 3,
      priority: "high",
      priorityScore: 92,
      predictedMealsSaved: 48,
      status: "open",
      siteName: "Main Kitchen",
      siteId: DEMO_SITE_ID,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "don_002",
      item: "Fresh apples",
      quantity: "15 kg",
      expirationDate: new Date(Date.now() + 259200000).toISOString(),
      suggestedRecipientCount: 2,
      priority: "medium",
      priorityScore: 68,
      predictedMealsSaved: 35,
      status: "open",
      siteName: "Main Kitchen",
      siteId: DEMO_SITE_ID,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "don_003",
      item: "Whole wheat bread loaves",
      quantity: "18 loaves",
      expirationDate: new Date(Date.now() + 86400000).toISOString(),
      suggestedRecipientCount: 4,
      priority: "high",
      priorityScore: 88,
      predictedMealsSaved: 36,
      status: "open",
      siteName: "Main Kitchen",
      siteId: DEMO_SITE_ID,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ];
}

/** Backward-compatible export for dashboard fixtures */
export function getMockDonationOpportunitiesFromRescue(orgId: string = DEMO_ORG): DonationOpportunity[] {
  return getMockRescueOpportunities(orgId);
}
