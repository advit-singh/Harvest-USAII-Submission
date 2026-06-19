"use client";

import { ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TIME_RANGE_OPTIONS,
  SITE_OPTIONS,
} from "@/features/analytics/config/analytics-tabs";
import { getMockHierarchyNodes } from "@/lib/mocks/analytics-fixtures";
import type { HierarchyLevel } from "@/types/analytics";
import type { AnalyticsFiltersInput } from "@/features/analytics/schemas/analytics-filters.schema";

interface AnalyticsToolbarProps {
  filters: AnalyticsFiltersInput;
  onFiltersChange: (partial: Partial<AnalyticsFiltersInput>) => void;
  onReset: () => void;
}

const HIERARCHY_ORDER: HierarchyLevel[] = [
  "organization",
  "region",
  "campus",
  "building",
  "kitchen",
  "storage",
];

export function AnalyticsToolbar({
  filters,
  onFiltersChange,
  onReset,
}: AnalyticsToolbarProps) {
  const hierarchyNodes = getMockHierarchyNodes();
  const currentNode =
    hierarchyNodes.find((n) => n.level === filters.hierarchyLevel) ??
    hierarchyNodes[0];

  const drillDown = () => {
    const currentIndex = HIERARCHY_ORDER.indexOf(filters.hierarchyLevel);
    if (currentIndex < HIERARCHY_ORDER.length - 1) {
      const nextLevel = HIERARCHY_ORDER[currentIndex + 1];
      const nextNode = hierarchyNodes.find((n) => n.level === nextLevel);
      if (nextNode) {
        onFiltersChange({
          hierarchyLevel: nextLevel,
          hierarchyId: nextNode.id,
        });
      }
    }
  };

  const rollUp = () => {
    const currentIndex = HIERARCHY_ORDER.indexOf(filters.hierarchyLevel);
    if (currentIndex > 0) {
      const prevLevel = HIERARCHY_ORDER[currentIndex - 1];
      const prevNode = hierarchyNodes.find((n) => n.level === prevLevel);
      if (prevNode) {
        onFiltersChange({
          hierarchyLevel: prevLevel,
          hierarchyId: prevNode.id,
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.timeRange}
          onValueChange={(value) =>
            onFiltersChange({
              timeRange: value as AnalyticsFiltersInput["timeRange"],
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

      <nav
        className="flex items-center gap-1 text-sm"
        aria-label="Hierarchy navigation"
      >
        <button
          type="button"
          onClick={rollUp}
          disabled={filters.hierarchyLevel === "organization"}
          className="text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          Roll up
        </button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
        <span className="font-medium">{currentNode.name}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
        <button
          type="button"
          onClick={drillDown}
          disabled={filters.hierarchyLevel === "storage"}
          className="text-primary hover:underline disabled:opacity-40"
        >
          Drill down
        </button>
      </nav>
    </div>
  );
}
