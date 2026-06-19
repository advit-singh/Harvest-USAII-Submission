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
} from "recharts";
import { ChartContainer } from "@/components/charts/ChartContainer";
import type { TimeSeriesPoint } from "@/types/analytics";

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  variant?: "line" | "area" | "bar";
  height?: number;
  color?: string;
  fillColor?: string;
  yAxisLabel?: string;
}

export function TimeSeriesChart({
  data,
  variant = "area",
  height = 280,
  color = "var(--color-primary)",
  fillColor = "var(--color-primary-soft)",
  yAxisLabel,
}: TimeSeriesChartProps) {
  if (data.length === 0) return null;

  const commonProps = {
    data,
    margin: { top: 8, right: 8, left: 0, bottom: 0 },
  };

  return (
    <ChartContainer height={height}>
      {variant === "bar" ? (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", fontSize: 11 } : undefined}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      ) : variant === "line" ? (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      ) : (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={fillColor}
            strokeWidth={2}
          />
        </AreaChart>
      )}
    </ChartContainer>
  );
}
