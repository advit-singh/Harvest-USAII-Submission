"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDonationOpportunities } from "@/lib/api/donations";
import { donationKeys } from "@/features/rescue/hooks/rescue-keys";

export { donationKeys };

export function useDonationOpportunities(orgId: string | null) {
  return useQuery({
    queryKey: donationKeys.opportunities(orgId ?? ""),
    queryFn: () => fetchDonationOpportunities(orgId!),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
