"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsQueryState } from "@/features/analytics/components/AnalyticsQueryState";
import { MetricSummaryGrid } from "@/features/analytics/components/MetricSummaryGrid";
import { TimeSeriesChart } from "@/features/analytics/components/charts/TimeSeriesChart";
import { BreakdownBarChart } from "@/features/analytics/components/charts/BreakdownBarChart";
import { ExportCsvButton } from "@/features/analytics/components/ExportCsvButton";
import { useDonationAnalytics } from "@/features/analytics/hooks/useDonationAnalytics";
import type { AnalyticsFilters } from "@/types/analytics";
import { Heart } from "lucide-react";

interface DonationAnalysisTabProps {
  orgId: string;
  filters: AnalyticsFilters;
}

export function DonationAnalysisTab({ orgId, filters }: DonationAnalysisTabProps) {
  const query = useDonationAnalytics(orgId, filters);

  return (
    <AnalyticsQueryState
      query={query}
      emptyIcon={Heart}
      isEmpty={(data) => data.history.length === 0}
    >
      {(data) => (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ExportCsvButton
              filename="donation-analytics.csv"
              headers={["Recipient", "Meals", "Share"]}
              rows={data.recipientPerformance.map((item) => [
                item.name,
                item.value,
                `${item.percent ?? 0}%`,
              ])}
            />
          </div>

          <MetricSummaryGrid metrics={data.summary} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Donation History</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart
                data={data.history}
                variant="area"
                xAxisLabel="Week"
                yAxisLabel="Meals"
                valueLabel="Meals donated"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recipient Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <BreakdownBarChart
                data={data.recipientPerformance}
                layout="horizontal"
                xAxisLabel="Meals"
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Meals rescued</p>
                  <p className="text-lg font-bold">{data.mealsRescued}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Success rate</p>
                  <p className="text-lg font-bold">
                    {Math.round(data.successRate * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AnalyticsQueryState>
  );
}
