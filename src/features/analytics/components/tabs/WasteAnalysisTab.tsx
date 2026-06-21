"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsQueryState } from "@/features/analytics/components/AnalyticsQueryState";
import { MetricSummaryGrid } from "@/features/analytics/components/MetricSummaryGrid";
import { TimeSeriesChart } from "@/features/analytics/components/charts/TimeSeriesChart";
import { BreakdownBarChart } from "@/features/analytics/components/charts/BreakdownBarChart";
import { RootCausePanel } from "@/features/analytics/components/panels/RootCausePanel";
import { DrillDownDrawer } from "@/features/analytics/components/panels/DrillDownDrawer";
import { ExportCsvButton } from "@/features/analytics/components/ExportCsvButton";
import { useWasteAnalytics } from "@/features/analytics/hooks/useWasteAnalytics";
import type { AnalyticsFilters, BreakdownItem } from "@/types/analytics";

interface WasteAnalysisTabProps {
  orgId: string;
  filters: AnalyticsFilters;
}

export function WasteAnalysisTab({ orgId, filters }: WasteAnalysisTabProps) {
  const query = useWasteAnalytics(orgId, filters);
  const [drillItem, setDrillItem] = useState<BreakdownItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleBarClick = (item: BreakdownItem) => {
    setDrillItem(item);
    setDrawerOpen(true);
  };

  return (
    <AnalyticsQueryState
      query={query}
      isEmpty={(data) => data.timeSeries.length === 0}
    >
      {(data) => (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ExportCsvButton
              filename="waste-analytics.csv"
              headers={["Category", "Value", "Unit", "Percent"]}
              rows={data.byCategory.map((item) => [
                item.name,
                item.value,
                item.unit ?? "",
                item.percent ?? "",
              ])}
            />
          </div>

          <MetricSummaryGrid metrics={data.summary} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Waste Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart
                data={data.timeSeries}
                variant="area"
                yAxisLabel="kg"
                xAxisLabel="Period"
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Waste by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBarChart
                  data={data.byCategory}
                  onBarClick={handleBarClick}
                  xAxisLabel="Category"
                  yAxisLabel="kg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Waste by Item</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBarChart
                  data={data.byItem}
                  layout="horizontal"
                  onBarClick={handleBarClick}
                  xAxisLabel="kg"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Waste by Site</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBarChart data={data.bySite} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Waste by Event</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBarChart data={data.byEvent} />
              </CardContent>
            </Card>
          </div>

          <RootCausePanel rootCause={data.rootCause} />

          <DrillDownDrawer
            item={drillItem}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          />
        </div>
      )}
    </AnalyticsQueryState>
  );
}
