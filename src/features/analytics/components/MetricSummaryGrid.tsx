"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricSummary } from "@/types/analytics";

interface MetricSummaryGridProps {
  metrics: MetricSummary[];
  className?: string;
}

export function MetricSummaryGrid({ metrics, className }: MetricSummaryGridProps) {
  if (metrics.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-4",
        className,
      )}
    >
      {metrics.map((metric) => (
        <Card key={metric.id}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <p className="text-xl font-bold">
                {metric.value}
                {metric.unit && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {metric.unit}
                  </span>
                )}
              </p>
            </div>
            {metric.trend && metric.trendPercent !== undefined && (
              <div
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs",
                  metric.trend === "up" && "text-destructive",
                  metric.trend === "down" && "text-primary",
                  metric.trend === "flat" && "text-muted-foreground",
                )}
              >
                {metric.trend === "up" && <TrendingUp className="h-3 w-3" aria-hidden />}
                {metric.trend === "down" && <TrendingDown className="h-3 w-3" aria-hidden />}
                {metric.trend === "flat" && <Minus className="h-3 w-3" aria-hidden />}
                <span>
                  {metric.trendPercent > 0 ? "+" : ""}
                  {metric.trendPercent}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
