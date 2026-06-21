"use client";

import { Area, AreaChart, XAxis, YAxis, Tooltip, Label } from "recharts";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { AiBadge } from "@/components/ai/AiBadge";
import type { ForecastSummary } from "@/types/forecast";

interface ForecastExplorerChartProps {
  forecast: ForecastSummary;
  onSelect?: () => void;
}

export function ForecastExplorerChart({
  forecast,
  onSelect,
}: ForecastExplorerChartProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`View forecast details for ${forecast.siteName}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{forecast.siteName}</h3>
            <AiBadge />
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {forecast.forecastType} · {forecast.forecastWindowDays}-day window
          </p>
        </div>
        <ConfidenceIndicator
          value={Math.round(forecast.confidence * 100)}
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Predicted meals</p>
          <p className="font-semibold">{forecast.predictedMeals}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Inventory units</p>
          <p className="font-semibold">{forecast.predictedInventoryUnits}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Trend</p>
          <p className="font-semibold capitalize">{forecast.trend}</p>
        </div>
      </div>

      <ChartContainer height={180} aria-label="Forecast trend chart">
        <AreaChart data={forecast.historyPoints}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}>
            <Label value="Day" offset={-4} position="insideBottom" fontSize={11} />
          </XAxis>
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32}>
            <Label value="Meals" angle={-90} position="insideLeft" fontSize={11} />
          </YAxis>
          <Tooltip content={<ChartTooltip valueLabel="Predicted meals" />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            fill="var(--color-primary-soft)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </button>
  );
}
