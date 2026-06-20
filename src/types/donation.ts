/** API_SPEC §36–38 donation opportunities and records */

export type DonationPriority = "low" | "medium" | "high";

export type DonationOpportunityStatus =
  | "open"
  | "matched"
  | "completed"
  | "dismissed";

export interface DonationOpportunity {
  id: string;
  item: string;
  quantity: string;
  expirationDate: string;
  suggestedRecipientCount: number;
  priority: DonationPriority;
  priorityScore: number;
  predictedMealsSaved: number;
  status: DonationOpportunityStatus;
  siteName: string;
  siteId?: string;
  createdAt?: string;
}

export interface DonationMatchFactor {
  label: string;
  value: string;
  weight?: number;
}

export interface DonationMatchCandidate {
  recipientId: string;
  recipientName: string;
  matchScore: number;
  distanceKm: number;
  reasoning: string;
  pickupAvailability: string;
  compatibility: string;
  factors: DonationMatchFactor[];
  confidence: number;
}

export interface DonationMatchResult {
  opportunityId: string;
  candidates: DonationMatchCandidate[];
  generatedAt: string;
}

export type DonationRecordStatus = "completed" | "failed" | "in_progress";

export interface DonationRecord {
  id: string;
  opportunityId: string;
  item: string;
  quantity: string;
  recipientName: string;
  recipientId: string;
  status: DonationRecordStatus;
  mealsRescued: number;
  completedAt: string;
  siteName: string;
  failureReason?: string;
}

export interface DonationCompletionPayload {
  recipientId: string;
  notes?: string;
  confirmedByUser: boolean;
}

export interface DonationCompletionResult {
  donation: DonationRecord;
  impactDelta: {
    mealsSaved: number;
    foodDivertedKg: number;
    moneySaved: number;
    co2AvoidedKg: number;
  };
}

export interface DismissDonationPayload {
  reason?: string;
}

export interface DismissDonationResult {
  id: string;
  status: "dismissed";
}
