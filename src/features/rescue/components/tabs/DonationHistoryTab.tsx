"use client";

import { History } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RescueQueryState } from "@/features/rescue/components/RescueQueryState";
import { DonationHistoryTable } from "@/features/rescue/components/history/DonationHistoryTable";
import { useDonationHistory } from "@/features/rescue/hooks/useDonationHistory";
import type { DonationHistoryFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";

interface DonationHistoryTabProps {
  orgId: string;
  filters: DonationHistoryFiltersInput;
  onFiltersChange: (partial: Partial<DonationHistoryFiltersInput>) => void;
}

export function DonationHistoryTab({
  orgId,
  filters,
  onFiltersChange,
}: DonationHistoryTabProps) {
  const query = useDonationHistory(orgId, filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="min-w-[140px] space-y-1">
          <Label htmlFor="history-status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onFiltersChange({
                status: value as DonationHistoryFiltersInput["status"],
              })
            }
          >
            <SelectTrigger id="history-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <RescueQueryState
        query={query}
        emptyIcon={History}
        emptyTitle="No donation history"
        emptyDescription="Completed donations will appear here."
        isEmpty={(data) => data.length === 0}
      >
        {(records) => <DonationHistoryTable records={records} />}
      </RescueQueryState>
    </div>
  );
}
