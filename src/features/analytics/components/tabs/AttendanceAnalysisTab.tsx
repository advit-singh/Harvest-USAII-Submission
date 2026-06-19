"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsQueryState } from "@/features/analytics/components/AnalyticsQueryState";
import { MetricSummaryGrid } from "@/features/analytics/components/MetricSummaryGrid";
import { TimeSeriesChart } from "@/features/analytics/components/charts/TimeSeriesChart";
import { BreakdownBarChart } from "@/features/analytics/components/charts/BreakdownBarChart";
import { ExportCsvButton } from "@/features/analytics/components/ExportCsvButton";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { useAttendanceAnalytics } from "@/features/analytics/hooks/useAttendanceAnalytics";
import type { AnalyticsFilters } from "@/types/analytics";
import { Users } from "lucide-react";

interface AttendanceAnalysisTabProps {
  orgId: string;
  filters: AnalyticsFilters;
}

export function AttendanceAnalysisTab({ orgId, filters }: AttendanceAnalysisTabProps) {
  const query = useAttendanceAnalytics(orgId, filters);

  return (
    <AnalyticsQueryState
      query={query}
      emptyIcon={Users}
      isEmpty={(data) => data.trends.length === 0}
    >
      {(data) => (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ExportCsvButton
              filename="attendance-analytics.csv"
              headers={["Day", "Attendance"]}
              rows={data.trends.map((point) => [point.date, point.value])}
            />
          </div>

          <MetricSummaryGrid metrics={data.summary} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={data.trends} variant="area" />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seasonality</CardTitle>
              </CardHeader>
              <CardContent>
                <TimeSeriesChart
                  data={data.seasonality}
                  variant="bar"
                  height={220}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Forecast Accuracy</CardTitle>
                  <ConfidenceIndicator
                    value={Math.round(data.forecastAccuracy * 100)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <BreakdownBarChart
                  data={data.eventImpact}
                  layout="horizontal"
                />
                <p className="mt-3 text-xs text-muted-foreground">
                  Event impact on attendance variance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AnalyticsQueryState>
  );
}
