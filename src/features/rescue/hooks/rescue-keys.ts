import type { DonationHistoryFilters } from "@/types/rescue";

export const donationKeys = {
  all: ["donations"] as const,
  opportunities: (orgId: string) =>
    [...donationKeys.all, "opportunities", orgId] as const,
  opportunity: (id: string) =>
    [...donationKeys.all, "opportunity", id] as const,
  match: (id: string) => [...donationKeys.all, "match", id] as const,
  history: (orgId: string, filters: DonationHistoryFilters) =>
    [...donationKeys.all, "history", orgId, filters] as const,
};

export const recipientKeys = {
  all: ["recipients"] as const,
  list: (orgId: string) => [...recipientKeys.all, "list", orgId] as const,
};
