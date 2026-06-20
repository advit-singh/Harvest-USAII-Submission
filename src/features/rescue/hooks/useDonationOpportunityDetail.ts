"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDonationOpportunityById } from "@/lib/api/donations";
import { donationKeys } from "@/features/rescue/hooks/rescue-keys";

export function useDonationOpportunityDetail(id: string | null) {
  return useQuery({
    queryKey: donationKeys.opportunity(id ?? ""),
    queryFn: () => fetchDonationOpportunityById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
