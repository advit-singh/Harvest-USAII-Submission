/** API_SPEC §36 donation opportunities */

export type DonationPriority = "low" | "medium" | "high";

export interface DonationOpportunity {
  id: string;
  item: string;
  quantity: string;
  expirationDate: string;
  suggestedRecipientCount: number;
  priority: DonationPriority;
  siteName: string;
}
