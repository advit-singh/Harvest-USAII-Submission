"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Label,
} from "recharts";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { CHART_PRIMARY } from "@/components/charts/chart-theme";
import type { BreakdownItem } from "@/types/analytics";

const CHART_COLORS = [
  CHART_PRIMARY,
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface BreakdownBarChartProps {
  data: BreakdownItem[];
  height?: number;
  onBarClick?: (item: BreakdownItem) => void;
  layout?: "horizontal" | "vertical";
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export function BreakdownBarChart({
  data,
  height,
  onBarClick,
  layout = "vertical",
  xAxisLabel,
  yAxisLabel,
}: BreakdownBarChartProps) {
  if (data.length === 0) return null;

  const isHorizontal = layout === "horizontal";
  const computedHeight = height ?? (isHorizontal ? Math.max(280, data.length * 44) : 280);
  const longestLabel = Math.max(...data.map((d) => d.name.length), 8);
  const yAxisWidth = isHorizontal ? Math.min(160, longestLabel * 7) : undefined;

  return (
    <ChartContainer height={computedHeight}>
      <BarChart
        data={data}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{
          top: 16,
          right: 16,
          left: isHorizontal ? (yAxisWidth ?? 80) : 8,
          bottom: xAxisLabel ? 28 : 8,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}>
              {xAxisLabel && (
                <Label value={xAxisLabel} offset={0} position="insideBottom" fontSize={11} />
              )}
            </XAxis>
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={yAxisWidth}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={data.length > 4 ? -25 : 0}
              textAnchor={data.length > 4 ? "end" : "middle"}
              height={data.length > 4 ? 60 : 30}
            >
              {xAxisLabel && (
                <Label value={xAxisLabel} offset={-4} position="insideBottom" fontSize={11} />
              )}
            </XAxis>
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}>
              {yAxisLabel && (
                <Label value={yAxisLabel} angle={-90} position="insideLeft" fontSize={11} />
              )}
            </YAxis>
          </>
        )}
        <Tooltip
          content={
            <ChartTooltip
              valueLabel={yAxisLabel ?? xAxisLabel ?? "Amount"}
              unit={data[0]?.unit}
            />
          }
        />
        <Bar
          dataKey="value"
          name={yAxisLabel ?? "Value"}
          radius={[4, 4, 0, 0]}
          cursor={onBarClick ? "pointer" : undefined}
          onClick={(entry) => {
            if (onBarClick && entry?.payload) {
              onBarClick(entry.payload as BreakdownItem);
            }
          }}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
