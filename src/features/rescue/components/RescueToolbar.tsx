"use client";

import { Button } from "@/components/ui/button";

interface RescueToolbarProps {
  onResetFilters: () => void;
}

export function RescueToolbar({ onResetFilters }: RescueToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">
        Convert surplus into donations with human-approved matching.
      </p>
      <Button variant="outline" size="sm" onClick={onResetFilters}>
        Reset filters
      </Button>
    </div>
  );
}
