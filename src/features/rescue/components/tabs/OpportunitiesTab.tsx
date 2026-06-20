"use client";

import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { OpportunityFilters } from "@/features/rescue/components/opportunities/OpportunityFilters";
import { OpportunityCard } from "@/features/rescue/components/opportunities/OpportunityCard";
import { RescueQueryState } from "@/features/rescue/components/RescueQueryState";
import { MatchReviewDrawer } from "@/features/rescue/components/matching/MatchReviewDrawer";
import { CompleteDonationDrawer } from "@/features/rescue/components/completion/CompleteDonationDrawer";
import { DonationFailureDialog } from "@/features/rescue/components/completion/DonationFailureDialog";
import { filterOpportunities } from "@/features/rescue/config/rescue-tabs";
import { useDonationOpportunities } from "@/features/rescue/hooks/useDonationOpportunities";
import { useDismissDonation } from "@/features/rescue/hooks/useDonationComplete";
import { useRecipients } from "@/features/rescue/hooks/useRecipients";
import type { RescueFilters } from "@/types/rescue";
import type { RescueFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";
import type { DonationHistoryFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";
import { toast } from "sonner";

interface OpportunitiesTabProps {
  orgId: string;
  filters: RescueFiltersInput;
  apiFilters: RescueFilters;
  historyFilters: DonationHistoryFiltersInput;
  selectedOpportunityId: string | null;
  selectedRecipientId: string | null;
  onFiltersChange: (partial: Partial<RescueFiltersInput>) => void;
  onSelectOpportunity: (id: string | null) => void;
  onSelectRecipient: (id: string | null) => void;
  initialOpportunityId?: string | null;
}

export function OpportunitiesTab({
  orgId,
  filters,
  apiFilters,
  historyFilters,
  selectedOpportunityId,
  selectedRecipientId,
  onFiltersChange,
  onSelectOpportunity,
  onSelectRecipient,
  initialOpportunityId,
}: OpportunitiesTabProps) {
  const query = useDonationOpportunities(orgId);
  const recipientsQuery = useRecipients(orgId);
  const dismissMutation = useDismissDonation(orgId);

  const [matchOpen, setMatchOpen] = useState(
    Boolean(initialOpportunityId),
  );
  const [completeOpen, setCompleteOpen] = useState(false);
  const [failureOpen, setFailureOpen] = useState(false);
  const [activeOpportunityId, setActiveOpportunityId] = useState<string | null>(
    initialOpportunityId ?? selectedOpportunityId,
  );

  const openMatch = (id: string) => {
    setActiveOpportunityId(id);
    onSelectOpportunity(id);
    setMatchOpen(true);
  };

  const openComplete = (id: string) => {
    setActiveOpportunityId(id);
    onSelectOpportunity(id);
    setCompleteOpen(true);
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissMutation.mutateAsync({ opportunityId: id });
      toast.success("Opportunity dismissed");
    } catch {
      toast.error("Failed to dismiss opportunity");
    }
  };

  const recipientName = recipientsQuery.data?.find(
    (r) => r.id === selectedRecipientId,
  )?.name;

  const resetFlows = () => {
    setMatchOpen(false);
    setCompleteOpen(false);
    setFailureOpen(false);
    onSelectOpportunity(null);
    onSelectRecipient(null);
    setActiveOpportunityId(null);
  };

  return (
    <div className="space-y-4">
      <OpportunityFilters filters={filters} onFiltersChange={onFiltersChange} />

      <RescueQueryState
        query={query}
        emptyIcon={HeartHandshake}
        emptyTitle="No donation opportunities"
        emptyDescription="Surplus items ready for rescue will appear here."
        isEmpty={(data) => data.length === 0}
      >
        {(opportunities) => {
          const filtered = filterOpportunities(opportunities, apiFilters);
          if (filtered.length === 0) {
            return (
              <EmptyState
                icon={HeartHandshake}
                title="No matching opportunities"
                description="Try adjusting your filters."
              />
            );
          }

          return (
            <ul className="space-y-4" role="list">
              {filtered.map((opp) => (
                <li key={opp.id}>
                  <OpportunityCard
                    opportunity={opp}
                    onReview={openMatch}
                    onMatch={openMatch}
                    onComplete={openComplete}
                    onDismiss={handleDismiss}
                    isDismissing={dismissMutation.isPending}
                  />
                </li>
              ))}
            </ul>
          );
        }}
      </RescueQueryState>

      <MatchReviewDrawer
        orgId={orgId}
        opportunityId={activeOpportunityId}
        open={matchOpen}
        onOpenChange={setMatchOpen}
        selectedRecipientId={selectedRecipientId}
        onSelectRecipient={onSelectRecipient}
        onProceedToComplete={() => {
          setMatchOpen(false);
          setCompleteOpen(true);
        }}
      />

      <CompleteDonationDrawer
        orgId={orgId}
        opportunityId={activeOpportunityId}
        recipientId={selectedRecipientId}
        recipientName={recipientName}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        historyFilters={historyFilters}
        onSuccess={resetFlows}
        onReportFailure={() => {
          setCompleteOpen(false);
          setFailureOpen(true);
        }}
      />

      <DonationFailureDialog
        orgId={orgId}
        opportunityId={activeOpportunityId}
        recipientId={selectedRecipientId}
        open={failureOpen}
        onOpenChange={setFailureOpen}
        historyFilters={historyFilters}
        onSuccess={resetFlows}
      />
    </div>
  );
}
