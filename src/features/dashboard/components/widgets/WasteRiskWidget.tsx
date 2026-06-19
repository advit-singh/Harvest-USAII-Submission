"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WidgetShell } from "@/features/dashboard/components/WidgetShell";
import { WidgetQueryState } from "@/features/dashboard/components/WidgetQueryState";
import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";
import type { RiskLevel } from "@/types/dashboard";

const RISK_VARIANT: Record<RiskLevel, "success" | "warning" | "destructive"> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low Waste Risk",
  medium: "Medium Waste Risk",
  high: "High Waste Risk",
};

interface WasteRiskWidgetProps {
  orgId: string;
}

export function WasteRiskWidget({ orgId }: WasteRiskWidgetProps) {
  const query = useDashboardOverview(orgId);

  return (
    <WidgetShell widgetId="waste-risk">
      <WidgetQueryState
        query={query}
        emptyIcon={AlertTriangle}
        emptyTitle="No risk data yet"
        emptyDescription="Upload operational data to see waste risk analysis."
      >
        {(data) => (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {RISK_LABEL[data.riskLevel]}
                </p>
                <p className="text-sm text-muted-foreground">
                  Next {data.forecastWindowDays} days
                </p>
              </div>
              <Badge variant={RISK_VARIANT[data.riskLevel]}>
                Score {data.riskScore}
              </Badge>
            </div>
            {data.primaryDrivers.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Contributors
                </p>
                <ul className="space-y-1">
                  {data.primaryDrivers.map((driver) => (
                    <li
                      key={driver}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </WidgetQueryState>
    </WidgetShell>
  );
}
