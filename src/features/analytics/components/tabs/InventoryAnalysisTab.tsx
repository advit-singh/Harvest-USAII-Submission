"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsQueryState } from "@/features/analytics/components/AnalyticsQueryState";
import { MetricSummaryGrid } from "@/features/analytics/components/MetricSummaryGrid";
import { TimeSeriesChart } from "@/features/analytics/components/charts/TimeSeriesChart";
import { BreakdownBarChart } from "@/features/analytics/components/charts/BreakdownBarChart";
import { ExportCsvButton } from "@/features/analytics/components/ExportCsvButton";
import { useInventoryAnalytics } from "@/features/analytics/hooks/useInventoryAnalytics";
import type { AnalyticsFilters } from "@/types/analytics";
import { Package } from "lucide-react";

interface InventoryAnalysisTabProps {
  orgId: string;
  filters: AnalyticsFilters;
}

export function InventoryAnalysisTab({ orgId, filters }: InventoryAnalysisTabProps) {
  const query = useInventoryAnalytics(orgId, filters);

  return (
    <AnalyticsQueryState
      query={query}
      emptyIcon={Package}
      isEmpty={(data) => data.trends.length === 0}
    >
      {(data) => (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ExportCsvButton
              filename="inventory-analytics.csv"
              headers={["Category", "Utilization"]}
              rows={data.categoryUtilization.map((item) => [
                item.name,
                `${item.value}${item.unit ?? ""}`,
              ])}
            />
          </div>

          <MetricSummaryGrid metrics={data.summary} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={data.trends} variant="line" />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expiration Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBarChart data={data.expirationRisk} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <BreakdownBarChart
                  data={data.categoryUtilization}
                  layout="horizontal"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storage Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Cold storage capacity</span>
                  <span className="font-semibold">{data.storageUtilization}%</span>
                </div>
                <div
                  className="h-3 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={data.storageUtilization}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${data.storageUtilization}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Turnover rate: {data.turnoverRate}x per period
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AnalyticsQueryState>
  );
}
