"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WIDGET_REGISTRY } from "@/features/dashboard/config/widget-registry";
import type { WidgetId } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface WidgetPickerProps {
  visibility: Record<WidgetId, boolean>;
  onToggle: (widgetId: WidgetId, visible: boolean) => void;
}

export function WidgetPicker({ visibility, onToggle }: WidgetPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" aria-hidden />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dashboard widgets</DialogTitle>
          <DialogDescription>
            Choose which widgets appear on your dashboard. Up to 8 widgets can
            be visible at once.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2" role="list">
          {WIDGET_REGISTRY.map((widget) => {
            const Icon = widget.icon;
            const isVisible = visibility[widget.id] ?? true;

            return (
              <li key={widget.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                    isVisible && "border-primary/30 bg-primary/5",
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-input"
                    checked={isVisible}
                    onChange={(e) => onToggle(widget.id, e.target.checked)}
                    aria-label={`Show ${widget.title} widget`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" aria-hidden />
                      <span className="text-sm font-medium">{widget.title}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {widget.description}
                    </p>
                  </div>
                </label>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
