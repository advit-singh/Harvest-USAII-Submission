"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WidgetShell } from "@/features/dashboard/components/WidgetShell";
import { WidgetQueryState } from "@/features/dashboard/components/WidgetQueryState";
import { useImpactMetrics } from "@/features/dashboard/hooks/useImpactMetrics";
import type { ImpactTimeRange } from "@/types/impact";

interface ImpactSnapshotWidgetProps {
  orgId: string;
}

export function ImpactSnapshotWidget({ orgId }: ImpactSnapshotWidgetProps) {
  const [timeRange, setTimeRange] = useState<ImpactTimeRange>("week");
  const query = useImpactMetrics(orgId, timeRange);

  return (
    <WidgetShell
      widgetId="impact-snapshot"
      action={
        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as ImpactTimeRange)}
        >
          <SelectTrigger className="h-8 w-[110px] text-xs" aria-label="Impact time range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <WidgetQueryState
        query={query}
        emptyIcon={Leaf}
        emptyTitle="No impact data yet"
        emptyDescription="Impact metrics appear as you prevent waste and rescue food."
      >
        {(data) => (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{data.periodLabel}</p>
            <div className="grid grid-cols-2 gap-3">
              <ImpactMetric
                label="Meals rescued"
                value={data.mealsSaved.toLocaleString()}
              />
              <ImpactMetric
                label="Food diverted"
                value={`${data.foodDivertedKg} kg`}
              />
              <ImpactMetric
                label="Money saved"
                value={`$${data.moneySaved.toLocaleString()}`}
              />
              <ImpactMetric
                label="CO₂ avoided"
                value={`${data.co2AvoidedKg} kg`}
              />
            </div>
          </div>
        )}
      </WidgetQueryState>
    </WidgetShell>
  );
}

function ImpactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--color-primary-soft)] p-2">
      <p className="text-lg font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
