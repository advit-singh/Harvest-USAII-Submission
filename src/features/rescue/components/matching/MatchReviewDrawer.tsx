"use client";

import { useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MatchCandidateCard } from "@/features/rescue/components/matching/MatchCandidateCard";
import { useDonationMatch, useRunDonationMatch } from "@/features/rescue/hooks/useDonationMatch";
import { useDonationOpportunityDetail } from "@/features/rescue/hooks/useDonationOpportunityDetail";

interface MatchReviewDrawerProps {
  orgId: string;
  opportunityId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecipientId: string | null;
  onSelectRecipient: (id: string) => void;
  onProceedToComplete: () => void;
}

export function MatchReviewDrawer({
  orgId,
  opportunityId,
  open,
  onOpenChange,
  selectedRecipientId,
  onSelectRecipient,
  onProceedToComplete,
}: MatchReviewDrawerProps) {
  const detailQuery = useDonationOpportunityDetail(opportunityId);
  const matchQuery = useDonationMatch(open ? opportunityId : null);
  const runMatch = useRunDonationMatch(orgId);

  useEffect(() => {
    if (open && opportunityId && !matchQuery.data && !matchQuery.isLoading) {
      runMatch.mutate(opportunityId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run match when drawer opens
  }, [open, opportunityId]);

  const opportunity = detailQuery.data;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>
            {opportunity ? `Match: ${opportunity.item}` : "Review matches"}
          </DrawerTitle>
          {opportunity && (
            <p className="text-sm text-muted-foreground">
              {opportunity.quantity} · {opportunity.siteName}
            </p>
          )}
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-6 space-y-4">
          {runMatch.isPending || matchQuery.isLoading ? (
            <LoadingState rows={3} />
          ) : matchQuery.isError ? (
            <ErrorState
              message="Unable to load match results."
              onRetry={() => opportunityId && runMatch.mutate(opportunityId)}
            />
          ) : matchQuery.data ? (
            <>
              <p className="text-sm text-muted-foreground">
                Ranked recipients based on distance, capacity, compatibility,
                and expiration urgency. Select a recipient to proceed.
              </p>

              <ul className="space-y-4" role="list">
                {matchQuery.data.candidates.map((candidate, index) => (
                  <li key={candidate.recipientId}>
                    <MatchCandidateCard
                      candidate={candidate}
                      rank={index + 1}
                      isSelected={selectedRecipientId === candidate.recipientId}
                      onSelect={onSelectRecipient}
                    />
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                disabled={!selectedRecipientId}
                onClick={onProceedToComplete}
              >
                Proceed to complete donation
              </Button>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
