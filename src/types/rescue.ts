/** Rescue Network workspace types */

export type RescueTabId =
  | "opportunities"
  | "recipients"
  | "history"
  | "impact";

export interface RescueFilters {
  priority: "all" | "low" | "medium" | "high";
  siteId: string;
  expirationWindow: "all" | "48h" | "7d";
  search: string;
}

export interface RecipientFilters {
  foodType: string;
  maxDistanceKm: number;
  minCapacity: number;
  search: string;
}

export interface DonationHistoryFilters {
  status: "all" | "completed" | "failed";
  siteId: string;
}
