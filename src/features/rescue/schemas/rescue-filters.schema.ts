import { z } from "zod";

export const rescueTabIdSchema = z.enum([
  "opportunities",
  "recipients",
  "history",
  "impact",
]);

export const rescueFiltersSchema = z.object({
  priority: z.enum(["all", "low", "medium", "high"]),
  siteId: z.string(),
  expirationWindow: z.enum(["all", "48h", "7d"]),
  search: z.string(),
});

export const recipientFiltersSchema = z.object({
  foodType: z.string(),
  maxDistanceKm: z.number().min(0).max(100),
  minCapacity: z.number().min(0),
  search: z.string(),
});

export const donationHistoryFiltersSchema = z.object({
  status: z.enum(["all", "completed", "failed"]),
  siteId: z.string(),
});

export type RescueFiltersInput = z.infer<typeof rescueFiltersSchema>;
export type RecipientFiltersInput = z.infer<typeof recipientFiltersSchema>;
export type DonationHistoryFiltersInput = z.infer<
  typeof donationHistoryFiltersSchema
>;

export const DEFAULT_RESCUE_FILTERS: RescueFiltersInput = {
  priority: "all",
  siteId: "all",
  expirationWindow: "all",
  search: "",
};

export const DEFAULT_RECIPIENT_FILTERS: RecipientFiltersInput = {
  foodType: "all",
  maxDistanceKm: 50,
  minCapacity: 0,
  search: "",
};

export const DEFAULT_DONATION_HISTORY_FILTERS: DonationHistoryFiltersInput = {
  status: "all",
  siteId: "all",
};
