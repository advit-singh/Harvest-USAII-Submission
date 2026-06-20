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
import type { RescueFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";

interface OpportunityFiltersProps {
  filters: RescueFiltersInput;
  onFiltersChange: (partial: Partial<RescueFiltersInput>) => void;
}

export function OpportunityFilters({
  filters,
  onFiltersChange,
}: OpportunityFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
      <div className="min-w-[140px] flex-1 space-y-1">
        <Label htmlFor="rescue-search">Search</Label>
        <Input
          id="rescue-search"
          placeholder="Search items or sites…"
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
        />
      </div>

      <div className="min-w-[120px] space-y-1">
        <Label htmlFor="rescue-priority">Priority</Label>
        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onFiltersChange({
              priority: value as RescueFiltersInput["priority"],
            })
          }
        >
          <SelectTrigger id="rescue-priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[120px] space-y-1">
        <Label htmlFor="rescue-expiration">Expires within</Label>
        <Select
          value={filters.expirationWindow}
          onValueChange={(value) =>
            onFiltersChange({
              expirationWindow: value as RescueFiltersInput["expirationWindow"],
            })
          }
        >
          <SelectTrigger id="rescue-expiration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="48h">48 hours</SelectItem>
            <SelectItem value="7d">7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
