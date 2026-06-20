"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RecipientFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";

const FOOD_TYPE_OPTIONS = [
  { value: "all", label: "All food types" },
  { value: "produce", label: "Produce" },
  { value: "dairy", label: "Dairy" },
  { value: "bread", label: "Bread" },
  { value: "prepared", label: "Prepared" },
  { value: "canned", label: "Canned" },
];

interface RecipientFiltersProps {
  filters: RecipientFiltersInput;
  onFiltersChange: (partial: Partial<RecipientFiltersInput>) => void;
}

export function RecipientFilters({
  filters,
  onFiltersChange,
}: RecipientFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
      <div className="min-w-[140px] flex-1 space-y-1">
        <Label htmlFor="recipient-search">Search</Label>
        <Input
          id="recipient-search"
          placeholder="Search recipients…"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
        />
      </div>

      <div className="min-w-[120px] space-y-1">
        <Label htmlFor="recipient-food">Food type</Label>
        <Select
          value={filters.foodType}
          onValueChange={(value) => onFiltersChange({ foodType: value })}
        >
          <SelectTrigger id="recipient-food">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FOOD_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[120px] space-y-1">
        <Label htmlFor="recipient-distance">Max distance (km)</Label>
        <Input
          id="recipient-distance"
          type="number"
          min={0}
          value={filters.maxDistanceKm}
          onChange={(e) =>
            onFiltersChange({ maxDistanceKm: Number(e.target.value) })
          }
        />
      </div>
    </div>
  );
}
