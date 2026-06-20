"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { ChartContainer } from "@/components/charts/ChartContainer";
import type { BreakdownItem } from "@/types/analytics";

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-muted-foreground)",
];

interface BreakdownBarChartProps {
  data: BreakdownItem[];
  height?: number;
  onBarClick?: (item: BreakdownItem) => void;
  layout?: "horizontal" | "vertical";
}

export function BreakdownBarChart({
  data,
  height = 280,
  onBarClick,
  layout = "vertical",
}: BreakdownBarChartProps) {
  if (data.length === 0) return null;

  const isHorizontal = layout === "horizontal";

  return (
    <ChartContainer height={height}>
      <BarChart
        data={data}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 8, left: isHorizontal ? 80 : 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={75}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        />
        <Bar
          dataKey="value"
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
