"use client";

import { useState } from "react";
import { ForecastExplorerFilters } from "@/features/predictions/components/explorer/ForecastExplorerFilters";
import { ForecastExplorerChart } from "@/features/predictions/components/explorer/ForecastExplorerChart";
import { ForecastDetailDrawer } from "@/features/predictions/components/explorer/ForecastDetailDrawer";
import { ForecastFactorsPanel } from "@/features/predictions/components/explorer/ForecastFactorsPanel";
import { PredictionsQueryState } from "@/features/predictions/components/PredictionsQueryState";
import { useForecastsList } from "@/features/predictions/hooks/useForecastsList";
import { useForecastDetail } from "@/features/predictions/hooks/useForecastDetail";
import { usePredictionsStore } from "@/store/predictions-store";
import type { PredictionsFilters } from "@/types/predictions";
import type { PredictionsFiltersInput } from "@/features/predictions/schemas/predictions-filters.schema";

interface ForecastExplorerSectionProps {
  orgId: string;
  filters: PredictionsFilters;
  filterInput: PredictionsFiltersInput;
  onFiltersChange: (partial: Partial<PredictionsFiltersInput>) => void;
}

export function ForecastExplorerSection({
  orgId,
  filters,
  filterInput,
  onFiltersChange,
}: ForecastExplorerSectionProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const setSelectedForecastId = usePredictionsStore(
    (s) => s.setSelectedForecastId,
  );
  const selectedForecastId = usePredictionsStore((s) =>
    orgId ? s.getStateForOrg(orgId).selectedForecastId : null,
  );

  const listQuery = useForecastsList(orgId, filters);
  const detailQuery = useForecastDetail(selectedForecastId);

  const openForecast = (id: string) => {
    setSelectedForecastId(orgId, id);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      <ForecastExplorerFilters
        filters={filterInput}
        onFiltersChange={onFiltersChange}
      />

      <PredictionsQueryState
        query={listQuery}
        isEmpty={(data) => data.length === 0}
      >
        {(forecasts) => (
          <div className="space-y-4">
            {forecasts.map((forecast) => (
              <ForecastExplorerChart
                key={forecast.id}
                forecast={forecast}
                onSelect={() => openForecast(forecast.id)}
              />
            ))}
          </div>
        )}
      </PredictionsQueryState>

      {detailQuery.data && !drawerOpen && (
        <ForecastFactorsPanel factors={detailQuery.data.factors} />
      )}

      <ForecastDetailDrawer
        forecastId={selectedForecastId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
