"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ANALYTICS_TABS } from "@/features/analytics/config/analytics-tabs";
import { WasteAnalysisTab } from "@/features/analytics/components/tabs/WasteAnalysisTab";
import { InventoryAnalysisTab } from "@/features/analytics/components/tabs/InventoryAnalysisTab";
import { AttendanceAnalysisTab } from "@/features/analytics/components/tabs/AttendanceAnalysisTab";
import { DonationAnalysisTab } from "@/features/analytics/components/tabs/DonationAnalysisTab";
import { ImpactAnalysisTab } from "@/features/analytics/components/tabs/ImpactAnalysisTab";
import type { AnalyticsFilters, AnalyticsTabId } from "@/types/analytics";

interface AnalyticsTabNavProps {
  orgId: string;
  filters: AnalyticsFilters;
  activeTab: AnalyticsTabId;
  onTabChange: (tab: AnalyticsTabId) => void;
}

export function AnalyticsTabNav({
  orgId,
  filters,
  activeTab,
  onTabChange,
}: AnalyticsTabNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as AnalyticsTabId;
      onTabChange(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`/analytics?${params.toString()}`, { scroll: false });
    },
    [onTabChange, router, searchParams],
  );

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        {ANALYTICS_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1.5"
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="waste">
        <WasteAnalysisTab orgId={orgId} filters={filters} />
      </TabsContent>
      <TabsContent value="inventory">
        <InventoryAnalysisTab orgId={orgId} filters={filters} />
      </TabsContent>
      <TabsContent value="attendance">
        <AttendanceAnalysisTab orgId={orgId} filters={filters} />
      </TabsContent>
      <TabsContent value="donations">
        <DonationAnalysisTab orgId={orgId} filters={filters} />
      </TabsContent>
      <TabsContent value="impact">
        <ImpactAnalysisTab orgId={orgId} filters={filters} />
      </TabsContent>
    </Tabs>
  );
}
