"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDonationHistory } from "@/lib/api/donations";
import { donationKeys } from "@/features/rescue/hooks/rescue-keys";
import type { DonationHistoryFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";

export function useDonationHistory(
  orgId: string | null,
  filters: DonationHistoryFiltersInput,
) {
  return useQuery({
    queryKey: donationKeys.history(orgId ?? "", filters),
    queryFn: () => fetchDonationHistory(orgId!, filters),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
