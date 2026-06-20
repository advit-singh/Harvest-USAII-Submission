"use client";

import { useQuery } from "@tanstack/react-query";
import { Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RescueQueryState } from "@/features/rescue/components/RescueQueryState";
import { fetchImpactMetrics } from "@/lib/api/impact";
import { useDonationHistory } from "@/features/rescue/hooks/useDonationHistory";
import type { ImpactTimeRange } from "@/types/impact";
import type { DonationHistoryFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";

interface RescueImpactTabProps {
  orgId: string;
  timeRange: ImpactTimeRange;
  historyFilters: DonationHistoryFiltersInput;
  onTimeRangeChange: (range: ImpactTimeRange) => void;
}

export function RescueImpactTab({
  orgId,
  timeRange,
  historyFilters,
  onTimeRangeChange,
}: RescueImpactTabProps) {
  const impactQuery = useQuery({
    queryKey: ["impact", orgId, timeRange],
    queryFn: () => fetchImpactMetrics(orgId, timeRange),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });

  const historyQuery = useDonationHistory(orgId, {
    ...historyFilters,
    status: "completed",
  });

  const completedCount = historyQuery.data?.length ?? 0;
  const totalMeals =
    historyQuery.data?.reduce((sum, r) => sum + r.mealsRescued, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4">
        <div className="min-w-[140px] space-y-1">
          <Label htmlFor="impact-range">Time range</Label>
          <Select
            value={timeRange}
            onValueChange={(v) => onTimeRangeChange(v as ImpactTimeRange)}
          >
            <SelectTrigger id="impact-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Donations completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meals rescued (history)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalMeals}</p>
          </CardContent>
        </Card>
      </div>

      <RescueQueryState
        query={impactQuery}
        emptyIcon={Leaf}
        emptyTitle="No impact data"
        emptyDescription="Impact metrics appear after donations are completed."
      >
        {(impact) => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Meals saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{impact.mealsSaved}</p>
                <p className="text-xs text-muted-foreground">{impact.periodLabel}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Food diverted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{impact.foodDivertedKg} kg</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Money saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${impact.moneySaved}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CO₂ avoided
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{impact.co2AvoidedKg} kg</p>
              </CardContent>
            </Card>
          </div>
        )}
      </RescueQueryState>
    </div>
  );
}
