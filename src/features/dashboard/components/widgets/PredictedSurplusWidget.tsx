"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { WidgetShell } from "@/features/dashboard/components/WidgetShell";
import { WidgetQueryState } from "@/features/dashboard/components/WidgetQueryState";
import { useForecasts } from "@/features/dashboard/hooks/useForecasts";

interface PredictedSurplusWidgetProps {
  orgId: string;
}

export function PredictedSurplusWidget({ orgId }: PredictedSurplusWidgetProps) {
  const query = useForecasts(orgId);

  return (
    <WidgetShell
      widgetId="predicted-surplus"
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/predictions">View all</Link>
        </Button>
      }
    >
      <WidgetQueryState
        query={query}
        emptyIcon={TrendingUp}
        emptyTitle="No forecasts yet"
        emptyDescription="Generate forecasts after uploading operational data."
        isEmpty={(data) => data.length === 0}
      >
        {(forecasts) => {
          const forecast = forecasts[0];
          return (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-2xl font-bold">{forecast.predictedMeals}</p>
                  <p className="text-xs text-muted-foreground">
                    predicted surplus meals · {forecast.siteName}
                  </p>
                </div>
                <ConfidenceIndicator
                  value={Math.round(forecast.confidence * 100)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-xs text-muted-foreground">Inventory units</p>
                  <p className="font-semibold">
                    {forecast.predictedInventoryUnits}
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-xs text-muted-foreground">Window</p>
                  <p className="font-semibold">
                    {forecast.forecastWindowDays} days
                  </p>
                </div>
              </div>
              <ChartContainer height={100}>
                <AreaChart data={forecast.historyPoints}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary-soft)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          );
        }}
      </WidgetQueryState>
    </WidgetShell>
  );
}
