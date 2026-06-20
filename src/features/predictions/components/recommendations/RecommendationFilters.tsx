"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SITE_OPTIONS } from "@/features/predictions/config/predictions-tabs";
import type { RecommendationFiltersInput } from "@/features/predictions/schemas/recommendation-filters.schema";

interface RecommendationFiltersProps {
  filters: RecommendationFiltersInput;
  onFiltersChange: (partial: Partial<RecommendationFiltersInput>) => void;
}

export function RecommendationFilters({
  filters,
  onFiltersChange,
}: RecommendationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFiltersChange({
            status: value as RecommendationFiltersInput["status"],
          })
        }
      >
        <SelectTrigger className="w-[130px]" aria-label="Status filter">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="snoozed">Snoozed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(value) =>
          onFiltersChange({
            priority: value as RecommendationFiltersInput["priority"],
          })
        }
      >
        <SelectTrigger className="w-[130px]" aria-label="Priority filter">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
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
        <SelectTrigger className="w-[200px]" aria-label="Site filter">
          <SelectValue />
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
        value={filters.sortBy}
        onValueChange={(value) =>
          onFiltersChange({
            sortBy: value as RecommendationFiltersInput["sortBy"],
          })
        }
      >
        <SelectTrigger className="w-[140px]" aria-label="Sort by">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="createdAt">Date</SelectItem>
          <SelectItem value="confidence">Confidence</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
