"use client";

import { RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_OPTIONS,
  FORECAST_TYPE_OPTIONS,
  SITE_OPTIONS,
  TIME_RANGE_OPTIONS,
} from "@/features/predictions/config/predictions-tabs";
import { useGenerateForecast } from "@/features/predictions/hooks/useGenerateForecast";
import type { PredictionsFiltersInput } from "@/features/predictions/schemas/predictions-filters.schema";

interface PredictionsToolbarProps {
  orgId: string;
  filters: PredictionsFiltersInput;
  onFiltersChange: (partial: Partial<PredictionsFiltersInput>) => void;
  onReset: () => void;
}

export function PredictionsToolbar({
  orgId,
  filters,
  onFiltersChange,
  onReset,
}: PredictionsToolbarProps) {
  const generateMutation = useGenerateForecast(orgId);

  const handleGenerate = () => {
    generateMutation.mutate(
      {
        forecastType: "surplus",
        siteId: filters.siteId ?? "site_001",
        days: filters.timeRange === "week" ? 7 : filters.timeRange === "month" ? 30 : 90,
      },
      {
        onSuccess: () => {
          toast.success("Forecast generated", {
            description: "Latest predictions are ready to review.",
          });
        },
        onError: () => {
          toast.error("Forecast generation failed", {
            description: "Please try again.",
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.timeRange}
          onValueChange={(value) =>
            onFiltersChange({
              timeRange: value as PredictionsFiltersInput["timeRange"],
            })
          }
        >
          <SelectTrigger className="w-[140px]" aria-label="Time range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.siteId ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              siteId: value === "all" ? null : value,
            })
          }
        >
          <SelectTrigger className="w-[220px]" aria-label="Site filter">
            <SelectValue placeholder="All sites" />
          </SelectTrigger>
          <SelectContent>
            {SITE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              category: value === "all" ? null : value,
            })
          }
        >
          <SelectTrigger className="w-[160px]" aria-label="Category filter">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.forecastType ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              forecastType: value === "all" ? null : value,
            })
          }
        >
          <SelectTrigger className="w-[140px]" aria-label="Forecast type">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            {FORECAST_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label="Reset filters"
        >
          <RotateCcw className="mr-1 h-4 w-4" aria-hidden />
          Reset
        </Button>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={generateMutation.isPending}
        aria-label="Generate forecast"
      >
        <Sparkles className="mr-2 h-4 w-4" aria-hidden />
        {generateMutation.isPending ? "Generating…" : "Generate forecast"}
      </Button>
    </div>
  );
}
