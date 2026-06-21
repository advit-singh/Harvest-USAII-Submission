"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from "recharts";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { CHART_PRIMARY, CHART_PRIMARY_SOFT, resolveChartMargin } from "@/components/charts/chart-theme";
import type { TimeSeriesPoint } from "@/types/analytics";

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  variant?: "line" | "area" | "bar";
  height?: number;
  color?: string;
  fillColor?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  valueLabel?: string;
  unit?: string;
}

export function TimeSeriesChart({
  data,
  variant = "area",
  height = 280,
  color = CHART_PRIMARY,
  fillColor = CHART_PRIMARY_SOFT,
  yAxisLabel,
  xAxisLabel,
  valueLabel = "Value",
  unit,
}: TimeSeriesChartProps) {
  if (data.length === 0) return null;

  const commonProps = {
    data,
    margin: resolveChartMargin(yAxisLabel, xAxisLabel),
  };

  const tooltip = (
    <Tooltip content={<ChartTooltip valueLabel={valueLabel} unit={unit} />} />
  );

  return (
    <ChartContainer height={height}>
      {variant === "bar" ? (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}>
            {xAxisLabel && (
              <Label value={xAxisLabel} offset={-4} position="insideBottom" fontSize={11} />
            )}
          </XAxis>
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}>
            {yAxisLabel && (
              <Label value={yAxisLabel} angle={-90} position="insideLeft" fontSize={11} />
            )}
          </YAxis>
          {tooltip}
          <Bar dataKey="value" name={valueLabel} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : variant === "line" ? (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}>
            {xAxisLabel && (
              <Label value={xAxisLabel} offset={-4} position="insideBottom" fontSize={11} />
            )}
          </XAxis>
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}>
            {yAxisLabel && (
              <Label value={yAxisLabel} angle={-90} position="insideLeft" fontSize={11} />
            )}
          </YAxis>
          {tooltip}
          <Line
            type="monotone"
            dataKey="value"
            name={valueLabel}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      ) : (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}>
            {xAxisLabel && (
              <Label value={xAxisLabel} offset={-4} position="insideBottom" fontSize={11} />
            )}
          </XAxis>
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}>
            {yAxisLabel && (
              <Label value={yAxisLabel} angle={-90} position="insideLeft" fontSize={11} />
            )}
          </YAxis>
          {tooltip}
          <Area
            type="monotone"
            dataKey="value"
            name={valueLabel}
            stroke={color}
            fill={fillColor}
            strokeWidth={2}
          />
        </AreaChart>
      )}
    </ChartContainer>
  );
}
