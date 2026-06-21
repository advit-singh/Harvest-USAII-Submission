"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getWidgetDefinition } from "@/features/dashboard/config/widget-registry";
import type { WidgetId } from "@/types/dashboard";

interface WidgetShellProps {
  widgetId: WidgetId;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function WidgetShell({
  widgetId,
  children,
  className,
  action,
}: WidgetShellProps) {
  const definition = getWidgetDefinition(widgetId);
  const Icon = definition?.icon;

  return (
    <Card className={cn("flex h-full flex-col overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
          <CardTitle className="truncate text-sm font-semibold">
            {definition?.title}
          </CardTitle>
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4">{children}</CardContent>
    </Card>
  );
}
