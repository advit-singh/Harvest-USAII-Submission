"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UploadFiltersInput } from "@/features/uploads/schemas/upload-filters.schema";

interface UploadToolbarProps {
  filters: UploadFiltersInput;
  onFiltersChange: (partial: Partial<UploadFiltersInput>) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
}

export function UploadToolbar({
  filters,
  onFiltersChange,
  onResetFilters,
  onRefresh,
}: UploadToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search files…"
        value={filters.search}
        onChange={(e) => onFiltersChange({ search: e.target.value })}
        className="max-w-xs"
        aria-label="Search uploads"
      />
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFiltersChange({
            status: value as UploadFiltersInput["status"],
          })
        }
      >
        <SelectTrigger className="w-[160px]" aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="review_required">Review required</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" onClick={onRefresh}>
        Refresh
      </Button>
      <Button variant="ghost" size="sm" onClick={onResetFilters}>
        Reset filters
      </Button>
    </div>
  );
}
