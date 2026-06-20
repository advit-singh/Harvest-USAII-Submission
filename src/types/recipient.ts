/** API_SPEC §39 recipients */

export type RecipientType =
  | "food_bank"
  | "shelter"
  | "community_fridge"
  | "school"
  | "community_kitchen"
  | "religious_org";

export interface Recipient {
  id: string;
  name: string;
  type: RecipientType;
  distanceKm: number;
  capacityMeals: number;
  foodTypesAccepted: string[];
  availability: string;
  operatingHours: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  organizationId: string;
}

export interface CreateRecipientPayload {
  name: string;
  type: RecipientType;
  distanceKm: number;
  capacityMeals: number;
  foodTypesAccepted: string[];
  availability: string;
  operatingHours: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}
