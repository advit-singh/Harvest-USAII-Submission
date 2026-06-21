"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCustomizeDialog } from "@/features/dashboard/components/DashboardCustomizeDialog";
import type { GridLayoutItem, WidgetId } from "@/types/dashboard";

interface DashboardToolbarProps {
  visibility: Record<WidgetId, boolean>;
  layouts: GridLayoutItem[];
  onToggleWidget: (widgetId: WidgetId, visible: boolean) => void;
  onLayoutChange: (layouts: GridLayoutItem[]) => void;
  onResetLayout: () => void;
}

export function DashboardToolbar({
  visibility,
  layouts,
  onToggleWidget,
  onLayoutChange,
  onResetLayout,
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <DashboardCustomizeDialog
        visibility={visibility}
        layouts={layouts}
        onToggle={onToggleWidget}
        onLayoutChange={onLayoutChange}
        onResetLayout={onResetLayout}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onResetLayout}
        aria-label="Reset dashboard layout to default"
      >
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
        Reset layout
      </Button>
    </div>
  );
}
