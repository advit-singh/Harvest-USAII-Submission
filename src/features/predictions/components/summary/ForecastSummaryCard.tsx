"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ForecastSummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  className?: string;
}

export function ForecastSummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: ForecastSummaryCardProps) {
  const trendLabel =
    trend === "up" ? "Trending up" : trend === "down" ? "Trending down" : undefined;

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm",
        className,
      )}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trendLabel && (
            <p className="text-xs text-muted-foreground">{trendLabel}</p>
          )}
        </div>
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </div>
      </div>
    </article>
  );
}
