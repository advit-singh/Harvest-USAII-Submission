"use client";

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
  ITEM_OPTIONS,
} from "@/features/predictions/config/predictions-tabs";
import type { PredictionsFiltersInput } from "@/features/predictions/schemas/predictions-filters.schema";

interface ForecastExplorerFiltersProps {
  filters: PredictionsFiltersInput;
  onFiltersChange: (partial: Partial<PredictionsFiltersInput>) => void;
}

export function ForecastExplorerFilters({
  filters,
  onFiltersChange,
}: ForecastExplorerFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={filters.forecastType ?? "all"}
        onValueChange={(value) =>
          onFiltersChange({
            forecastType: value === "all" ? null : value,
          })
        }
      >
        <SelectTrigger className="w-[140px]" aria-label="Forecast type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FORECAST_TYPE_OPTIONS.map((opt) => (
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
        <SelectTrigger className="w-[160px]" aria-label="Inventory category">
          <SelectValue />
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
        value={filters.itemId ?? "all"}
        onValueChange={(value) =>
          onFiltersChange({
            itemId: value === "all" ? null : value,
          })
        }
      >
        <SelectTrigger className="w-[140px]" aria-label="Food item">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ITEM_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
