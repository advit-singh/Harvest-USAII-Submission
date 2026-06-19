"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { BreakdownItem } from "@/types/analytics";

interface DrillDownDrawerProps {
  item: BreakdownItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DrillDownDrawer({
  item,
  open,
  onOpenChange,
}: DrillDownDrawerProps) {
  if (!item) return null;

  const details = [
    `Value: ${item.value}${item.unit ? ` ${item.unit}` : ""}`,
    item.percent !== undefined ? `Share: ${item.percent}% of total` : null,
    "Drill-down data will expand when backend analytics are connected.",
  ].filter(Boolean) as string[];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item.name}</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-2 px-4 pb-8">
          {details.map((detail) => (
            <p key={detail} className="text-sm text-muted-foreground">
              {detail}
            </p>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
