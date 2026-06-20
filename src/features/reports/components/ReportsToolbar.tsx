"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportsToolbarProps {
  canGenerate: boolean;
  onResetFilters: () => void;
  onNewReport: () => void;
}

export function ReportsToolbar({
  canGenerate,
  onResetFilters,
  onNewReport,
}: ReportsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Build organizational reports from templates and track generation status.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
          Reset filters
        </Button>
        {canGenerate && (
          <Button size="sm" onClick={onNewReport}>
            New report
          </Button>
        )}
      </div>
    </div>
  );
}
