"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDonationOpportunities } from "@/lib/api/donations";

export const donationKeys = {
  all: ["donations"] as const,
  opportunities: (orgId: string) =>
    [...donationKeys.all, "opportunities", orgId] as const,
};

export function useDonationOpportunities(orgId: string | null) {
  return useQuery({
    queryKey: donationKeys.opportunities(orgId ?? ""),
    queryFn: () => fetchDonationOpportunities(orgId!),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
