"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsQueryState } from "@/features/analytics/components/AnalyticsQueryState";
import { MetricSummaryGrid } from "@/features/analytics/components/MetricSummaryGrid";
import { TimeSeriesChart } from "@/features/analytics/components/charts/TimeSeriesChart";
import { ExportCsvButton } from "@/features/analytics/components/ExportCsvButton";
import { useAnalyticsImpact } from "@/features/analytics/hooks/useAnalyticsImpact";
import type { AnalyticsFilters } from "@/types/analytics";
import { Leaf } from "lucide-react";

interface ImpactAnalysisTabProps {
  orgId: string;
  filters: AnalyticsFilters;
}

export function ImpactAnalysisTab({ orgId, filters }: ImpactAnalysisTabProps) {
  const query = useAnalyticsImpact(orgId, filters);

  return (
    <AnalyticsQueryState
      query={query}
      emptyIcon={Leaf}
      isEmpty={(data) => data.summary.length === 0}
    >
      {(data) => (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ExportCsvButton
              filename="impact-analytics.csv"
              headers={["Metric", "Value"]}
              rows={data.summary.map((m) => [m.label, m.value])}
            />
          </div>

          <MetricSummaryGrid metrics={data.summary} />

          <div className="grid gap-6 lg:grid-cols-3">
            {([data.environmental, data.financial, data.community] as const).map(
              (group) => (
                <Card key={group.label}>
                  <CardHeader>
                    <CardTitle className="text-base">{group.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {group.metrics.map((metric) => (
                        <div
                          key={metric.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {metric.label}
                          </span>
                          <span className="font-semibold">
                            {metric.value}
                            {metric.unit && (
                              <span className="ml-1 text-xs font-normal text-muted-foreground">
                                {metric.unit}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <TimeSeriesChart
                      data={group.timeSeries}
                      variant="line"
                      height={160}
                      xAxisLabel="Week"
                      yAxisLabel="Impact"
                      valueLabel={group.label}
                    />
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </div>
      )}
    </AnalyticsQueryState>
  );
}
