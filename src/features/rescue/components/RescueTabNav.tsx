"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RESCUE_TABS } from "@/features/rescue/config/rescue-tabs";
import { OpportunitiesTab } from "@/features/rescue/components/tabs/OpportunitiesTab";
import { RecipientsTab } from "@/features/rescue/components/tabs/RecipientsTab";
import { DonationHistoryTab } from "@/features/rescue/components/tabs/DonationHistoryTab";
import { RescueImpactTab } from "@/features/rescue/components/tabs/RescueImpactTab";
import type { RescueTabId } from "@/types/rescue";
import type { RescueFilters } from "@/types/rescue";
import type {
  DonationHistoryFiltersInput,
  RecipientFiltersInput,
  RescueFiltersInput,
} from "@/features/rescue/schemas/rescue-filters.schema";
import type { ImpactTimeRange } from "@/types/impact";

interface RescueTabNavProps {
  orgId: string;
  filters: RescueFiltersInput;
  apiFilters: RescueFilters;
  recipientFilters: RecipientFiltersInput;
  historyFilters: DonationHistoryFiltersInput;
  activeTab: RescueTabId;
  selectedOpportunityId: string | null;
  selectedRecipientId: string | null;
  impactTimeRange: ImpactTimeRange;
  initialOpportunityId?: string | null;
  onTabChange: (tab: RescueTabId) => void;
  onFiltersChange: (partial: Partial<RescueFiltersInput>) => void;
  onRecipientFiltersChange: (partial: Partial<RecipientFiltersInput>) => void;
  onHistoryFiltersChange: (partial: Partial<DonationHistoryFiltersInput>) => void;
  onSelectOpportunity: (id: string | null) => void;
  onSelectRecipient: (id: string | null) => void;
  onImpactTimeRangeChange: (range: ImpactTimeRange) => void;
}

export function RescueTabNav({
  orgId,
  filters,
  apiFilters,
  recipientFilters,
  historyFilters,
  activeTab,
  selectedOpportunityId,
  selectedRecipientId,
  impactTimeRange,
  initialOpportunityId,
  onTabChange,
  onFiltersChange,
  onRecipientFiltersChange,
  onHistoryFiltersChange,
  onSelectOpportunity,
  onSelectRecipient,
  onImpactTimeRangeChange,
}: RescueTabNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as RescueTabId;
      onTabChange(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      params.delete("id");
      router.replace(`/rescue?${params.toString()}`, { scroll: false });
    },
    [onTabChange, router, searchParams],
  );

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        {RESCUE_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5"
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="opportunities">
        <OpportunitiesTab
          orgId={orgId}
          filters={filters}
          apiFilters={apiFilters}
          historyFilters={historyFilters}
          selectedOpportunityId={selectedOpportunityId}
          selectedRecipientId={selectedRecipientId}
          onFiltersChange={onFiltersChange}
          onSelectOpportunity={onSelectOpportunity}
          onSelectRecipient={onSelectRecipient}
          initialOpportunityId={initialOpportunityId}
        />
      </TabsContent>

      <TabsContent value="recipients">
        <RecipientsTab
          orgId={orgId}
          filters={recipientFilters}
          onFiltersChange={onRecipientFiltersChange}
        />
      </TabsContent>

      <TabsContent value="history">
        <DonationHistoryTab
          orgId={orgId}
          filters={historyFilters}
          onFiltersChange={onHistoryFiltersChange}
        />
      </TabsContent>

      <TabsContent value="impact">
        <RescueImpactTab
          orgId={orgId}
          timeRange={impactTimeRange}
          historyFilters={historyFilters}
          onTimeRangeChange={onImpactTimeRangeChange}
        />
      </TabsContent>
    </Tabs>
  );
}
