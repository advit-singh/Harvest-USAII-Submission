"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AiBadge } from "@/components/ai/AiBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { ForecastFactorsPanel } from "@/features/predictions/components/explorer/ForecastFactorsPanel";
import { useForecastDetail } from "@/features/predictions/hooks/useForecastDetail";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";

interface ForecastDetailDrawerProps {
  forecastId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForecastDetailDrawer({
  forecastId,
  open,
  onOpenChange,
}: ForecastDetailDrawerProps) {
  const query = useForecastDetail(forecastId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Forecast Detail</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-8">
          {query.isLoading && <LoadingState rows={3} />}
          {query.isError && (
            <ErrorState
              message="Unable to load forecast details."
              onRetry={() => query.refetch()}
            />
          )}
          {query.data && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      {query.data.siteName}
                    </h2>
                    <AiBadge />
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {query.data.forecastType} forecast ·{" "}
                    {query.data.forecastWindowDays} days
                  </p>
                </div>
                <ConfidenceIndicator
                  value={Math.round(query.data.confidence * 100)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Predicted surplus</p>
                  <p className="text-xl font-bold">
                    {query.data.predictedMeals} meals
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Predicted waste</p>
                  <p className="text-xl font-bold">
                    {query.data.predictedWasteMeals} meals
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Inventory units</p>
                  <p className="text-xl font-bold">
                    {query.data.predictedInventoryUnits}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Attendance forecast</p>
                  <p className="text-xl font-bold">
                    {query.data.attendanceForecast}
                  </p>
                </div>
              </div>

              <ForecastFactorsPanel factors={query.data.factors} />
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
