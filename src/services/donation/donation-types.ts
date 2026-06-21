export interface OpportunityLotContext {
  lotId: string;
  siteId: string;
  itemName: string;
  unit: string;
  remainingQuantity: number;
  expirationDate: Date;
  siteName: string;
  siteLatitude: string | null;
  siteLongitude: string | null;
}

export interface MatchRecipientContext {
  id: string;
  name: string;
  recipientType: string;
  latitude: string | null;
  longitude: string | null;
  capacityRating: number | null;
}

export interface MatchOpportunityContext {
  opportunityId: string;
  itemName: string;
  unit: string;
  quantity: number;
  expirationDate: Date;
  priorityScore: number;
  siteLatitude: string | null;
  siteLongitude: string | null;
}

export interface CompleteDonationInput {
  opportunityId: string;
  organizationId: string;
  recipientId: string;
  confirmedByUser: boolean;
  notes?: string;
  userId?: string;
}

export interface ListOpportunitiesInput {
  organizationId: string;
  siteId?: string;
  status?: string;
}

export interface ListDonationHistoryInput {
  organizationId: string;
  status?: string;
  siteId?: string;
}

export interface CreateRecipientInput {
  organizationId: string;
  name: string;
  type: string;
  distanceKm: number;
  capacityMeals: number;
  foodTypesAccepted: string[];
  availability: string;
  operatingHours: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdBy?: string;
}

export interface SyncOpportunitiesInput {
  organizationId: string;
  siteId: string;
  expirationWindowDays?: number;
  createdBy?: string;
}
