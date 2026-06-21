"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WIDGET_REGISTRY } from "@/features/dashboard/config/widget-registry";
import type { GridLayoutItem, WidgetId } from "@/types/dashboard";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout/legacy";
import { cn } from "@/lib/utils";

import "react-grid-layout/css/styles.css";

const ResponsiveGridLayout = dynamic(
  () =>
    import("react-grid-layout/legacy").then((mod) => {
      const Grid = mod.WidthProvider(mod.Responsive);
      return Grid;
    }),
  { ssr: false },
);

interface DashboardCustomizeDialogProps {
  visibility: Record<WidgetId, boolean>;
  layouts: GridLayoutItem[];
  onToggle: (widgetId: WidgetId, visible: boolean) => void;
  onLayoutChange: (layouts: GridLayoutItem[]) => void;
  onResetLayout: () => void;
}

export function DashboardCustomizeDialog({
  visibility,
  layouts,
  onToggle,
  onLayoutChange,
  onResetLayout,
}: DashboardCustomizeDialogProps) {
  const [open, setOpen] = useState(false);

  const visibleLayouts = useMemo(
    () => layouts.filter((item) => visibility[item.i]),
    [layouts, visibility],
  );

  const gridLayouts = useMemo((): ResponsiveLayouts => {
    const mobileLayout: LayoutItem[] = visibleLayouts.map((item, index) => ({
      ...item,
      x: 0,
      y: index,
      w: 12,
      h: 1,
    }));
    return {
      lg: visibleLayouts.map((item) => ({ ...item, h: 1, w: 4 })),
      md: visibleLayouts.map((item) => ({ ...item, h: 1, w: 6 })),
      sm: mobileLayout,
    };
  }, [visibleLayouts]);

  const handleLayoutChange = useCallback(
    (_layout: Layout, allLayouts: ResponsiveLayouts) => {
      const target = allLayouts.lg ?? _layout;
      const mapped: GridLayoutItem[] = target.map((item) => {
        const existing = layouts.find((l) => l.i === item.i);
        return {
          i: item.i as WidgetId,
          x: item.x,
          y: item.y,
          w: existing?.w ?? 4,
          h: existing?.h ?? 2,
          minW: existing?.minW,
          minH: existing?.minH,
        };
      });
      onLayoutChange(mapped);
    },
    [layouts, onLayoutChange],
  );

  const visibleCount = Object.values(visibility).filter(Boolean).length;

  const handleToggle = (widgetId: WidgetId, checked: boolean) => {
    if (checked && visibleCount >= 8 && !visibility[widgetId]) {
      toast.error("Maximum 8 widgets can be visible at once");
      return;
    }
    onToggle(widgetId, checked);
  };

  const handleReset = () => {
    onResetLayout();
    toast.success("Layout restored to defaults");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" aria-hidden />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize dashboard</DialogTitle>
          <DialogDescription>
            Show or hide widgets and drag tiles to reorder. Changes apply when you close this dialog.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2" role="list">
          {WIDGET_REGISTRY.map((widget) => {
            const Icon = widget.icon;
            const isVisible = visibility[widget.id] ?? true;

            return (
              <li key={widget.id}>
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    isVisible && "border-primary/30 bg-primary/5",
                  )}
                >
                  <Checkbox
                    id={`widget-${widget.id}`}
                    checked={isVisible}
                    onCheckedChange={(checked) =>
                      handleToggle(widget.id, checked === true)
                    }
                    aria-label={`Show ${widget.title} widget`}
                  />
                  <label
                    htmlFor={`widget-${widget.id}`}
                    className="flex flex-1 cursor-pointer items-start gap-2"
                  >
                    <Icon className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                    <div>
                      <span className="text-sm font-medium">{widget.title}</span>
                      <p className="text-xs text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>

        {visibleLayouts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Widget order</p>
            <div className="rounded-lg border bg-muted/30 p-2">
              <ResponsiveGridLayout
                className="layout"
                layouts={gridLayouts}
                breakpoints={{ lg: 1024, md: 768, sm: 0 }}
                cols={{ lg: 12, md: 12, sm: 12 }}
                rowHeight={48}
                draggableHandle=".customize-drag-handle"
                onLayoutChange={handleLayoutChange}
                margin={[8, 8]}
                isResizable={false}
                isDraggable
                compactType="vertical"
              >
                {visibleLayouts.map((item) => {
                  const widget = WIDGET_REGISTRY.find((w) => w.id === item.i);
                  return (
                    <div
                      key={item.i}
                      className="customize-drag-handle flex cursor-grab items-center rounded-md border bg-card px-3 text-sm active:cursor-grabbing"
                    >
                      {widget?.title ?? item.i}
                    </div>
                  );
                })}
              </ResponsiveGridLayout>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={handleReset}>
            Reset to defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
