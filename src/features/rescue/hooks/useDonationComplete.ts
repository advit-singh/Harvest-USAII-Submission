"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  completeDonation,
  dismissDonationOpportunity,
  recordDonationFailure,
} from "@/lib/api/donations";
import { donationKeys } from "@/features/rescue/hooks/rescue-keys";
import type {
  DonationCompletionPayload,
  DismissDonationPayload,
} from "@/types/donation";
import type { DonationHistoryFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";

export function useDismissDonation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      opportunityId,
      payload,
    }: {
      opportunityId: string;
      payload?: DismissDonationPayload;
    }) => dismissDonationOpportunity(opportunityId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donationKeys.opportunities(orgId),
      });
    },
  });
}

export function useCompleteDonation(
  orgId: string,
  historyFilters: DonationHistoryFiltersInput,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      opportunityId,
      payload,
    }: {
      opportunityId: string;
      payload: DonationCompletionPayload;
    }) => completeDonation(opportunityId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donationKeys.opportunities(orgId),
      });
      void queryClient.invalidateQueries({
        queryKey: donationKeys.history(orgId, historyFilters),
      });
    },
  });
}

export function useRecordDonationFailure(
  orgId: string,
  historyFilters: DonationHistoryFiltersInput,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      opportunityId,
      recipientId,
      reason,
    }: {
      opportunityId: string;
      recipientId: string;
      reason: string;
    }) => recordDonationFailure(opportunityId, recipientId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donationKeys.history(orgId, historyFilters),
      });
    },
  });
}
