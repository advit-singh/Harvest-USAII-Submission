"use client";

import { LayoutGrid, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetPicker } from "@/features/dashboard/components/WidgetPicker";
import type { WidgetId } from "@/types/dashboard";

interface DashboardToolbarProps {
  visibility: Record<WidgetId, boolean>;
  onToggleWidget: (widgetId: WidgetId, visible: boolean) => void;
  onResetLayout: () => void;
}

export function DashboardToolbar({
  visibility,
  onToggleWidget,
  onResetLayout,
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <WidgetPicker visibility={visibility} onToggle={onToggleWidget} />
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
      <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
        <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
        <span>Drag widgets to rearrange</span>
      </div>
    </div>
  );
}
