"use client";

import {
  AlertTriangle,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { AiBadge } from "@/components/ai/AiBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { ForecastSummaryCard } from "@/features/predictions/components/summary/ForecastSummaryCard";
import { PredictionsQueryState } from "@/features/predictions/components/PredictionsQueryState";
import { useForecastSummaryKpis } from "@/features/predictions/hooks/useForecastsList";

interface ForecastSummaryGridProps {
  orgId: string;
}

export function ForecastSummaryGrid({ orgId }: ForecastSummaryGridProps) {
  const query = useForecastSummaryKpis(orgId);

  return (
    <PredictionsQueryState
      query={query}
      isEmpty={(data) => data.predictedSurplusMeals === 0}
      emptyTitle="No forecasts available"
      emptyDescription="Upload operational data and generate a forecast to see predictions."
    >
      {(kpis) => (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AiBadge />
              <span className="text-sm text-muted-foreground">
                {kpis.siteName} · {kpis.forecastWindowDays}-day window
              </span>
            </div>
            <ConfidenceIndicator
              value={Math.round(kpis.confidence * 100)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <ForecastSummaryCard
              title="Predicted Surplus"
              value={`${kpis.predictedSurplusMeals} meals`}
              subtitle="Meals above projected demand"
              icon={TrendingUp}
              trend="up"
            />
            <ForecastSummaryCard
              title="Predicted Waste"
              value={`${kpis.predictedWasteMeals} meals`}
              subtitle="At risk without intervention"
              icon={Trash2}
              trend="down"
            />
            <ForecastSummaryCard
              title="Expiration Risk"
              value={kpis.expirationRiskItems}
              subtitle="Items expiring soon"
              icon={AlertTriangle}
            />
            <ForecastSummaryCard
              title="Attendance Forecast"
              value={kpis.attendanceForecast}
              subtitle="Expected daily meals served"
              icon={Users}
            />
            <ForecastSummaryCard
              title="Purchasing Forecast"
              value={`$${kpis.purchasingForecast.toLocaleString()}`}
              subtitle="Projected procurement spend"
              icon={ShoppingCart}
            />
          </div>
        </div>
      )}
    </PredictionsQueryState>
  );
}
