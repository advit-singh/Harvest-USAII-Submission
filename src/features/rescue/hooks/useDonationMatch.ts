"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { matchDonationOpportunity } from "@/lib/api/donations";
import { donationKeys } from "@/features/rescue/hooks/rescue-keys";

export function useDonationMatch(opportunityId: string | null) {
  return useQuery({
    queryKey: donationKeys.match(opportunityId ?? ""),
    queryFn: () => matchDonationOpportunity(opportunityId!),
    enabled: Boolean(opportunityId),
    staleTime: 60_000,
  });
}

export function useRunDonationMatch(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opportunityId: string) =>
      matchDonationOpportunity(opportunityId),
    onSuccess: (data, opportunityId) => {
      queryClient.setQueryData(donationKeys.match(opportunityId), data);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: donationKeys.opportunities(orgId),
      });
    },
  });
}
