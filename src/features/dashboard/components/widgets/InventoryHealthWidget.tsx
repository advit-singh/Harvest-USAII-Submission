"use client";

import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WidgetShell } from "@/features/dashboard/components/WidgetShell";
import { WidgetQueryState } from "@/features/dashboard/components/WidgetQueryState";
import { useInventoryHealth } from "@/features/dashboard/hooks/useInventoryHealth";
import type { InventoryHealthStatus } from "@/types/inventory";

const STATUS_LABEL: Record<InventoryHealthStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
};

const STATUS_VARIANT: Record<
  InventoryHealthStatus,
  "success" | "warning" | "destructive"
> = {
  healthy: "success",
  warning: "warning",
  critical: "destructive",
};

interface InventoryHealthWidgetProps {
  orgId: string;
}

export function InventoryHealthWidget({ orgId }: InventoryHealthWidgetProps) {
  const query = useInventoryHealth(orgId);

  return (
    <WidgetShell widgetId="inventory-health">
      <WidgetQueryState
        query={query}
        emptyIcon={Package}
        emptyTitle="No inventory data"
        emptyDescription="Upload inventory logs to monitor health."
      >
        {(data) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">
                {STATUS_LABEL[data.status]}
              </p>
              <Badge variant={STATUS_VARIANT[data.status]}>
                {data.expiringItems} expiring
              </Badge>
            </div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Utilization</span>
                  <span>{data.utilizationPercent}%</span>
                </div>
                <Progress value={data.utilizationPercent} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Storage capacity</span>
                  <span>{data.storageCapacityPercent}%</span>
                </div>
                <Progress value={data.storageCapacityPercent} />
              </div>
            </div>
            {data.topAlerts.length > 0 && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {data.topAlerts.slice(0, 2).map((alert) => (
                  <li key={alert}>• {alert}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </WidgetQueryState>
    </WidgetShell>
  );
}
