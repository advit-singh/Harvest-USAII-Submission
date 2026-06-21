"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FlaskConical } from "lucide-react";
import { ScenarioInputPanel } from "@/features/predictions/components/simulator/ScenarioInputPanel";
import { ScenarioResultsPanel } from "@/features/predictions/components/simulator/ScenarioResultsPanel";
import { ScenarioCard } from "@/features/predictions/components/simulator/ScenarioCard";
import { ScenarioComparisonView } from "@/features/predictions/components/simulator/ScenarioComparisonView";
import { PredictionsQueryState } from "@/features/predictions/components/PredictionsQueryState";
import { useSimulations } from "@/features/predictions/hooks/useSimulations";
import { useRunSimulation } from "@/features/predictions/hooks/useRunSimulation";
import { useCompareSimulations } from "@/features/predictions/hooks/useCompareSimulations";
import { usePredictionsStore } from "@/store/predictions-store";
import { DEFAULT_SIMULATION_INPUT } from "@/features/predictions/schemas/simulation-input.schema";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { useExternalWeather } from "@/features/intelligence/hooks/useExternalData";
import { Badge } from "@/components/ui/badge";
import { Cloud } from "lucide-react";
import type { SimulationResult } from "@/types/simulation";
import type { SimulationInputForm } from "@/features/predictions/schemas/simulation-input.schema";

interface ScenarioSimulatorShellProps {
  orgId: string;
}

export function ScenarioSimulatorShell({ orgId }: ScenarioSimulatorShellProps) {
  const draft = usePredictionsStore((s) => {
    const stored = s.orgStates[orgId]?.simulatorDraft;
    return stored
      ? { ...DEFAULT_SIMULATION_INPUT, ...stored }
      : { ...DEFAULT_SIMULATION_INPUT };
  });
  const compareIds = usePredictionsStore(
    (s) => s.orgStates[orgId]?.compareScenarioIds ?? [],
  );
  const setSimulatorDraft = usePredictionsStore((s) => s.setSimulatorDraft);
  const setCompareScenarioIds = usePredictionsStore(
    (s) => s.setCompareScenarioIds,
  );
  const { activeOrg } = useOrganizations();
  const weatherQuery = useExternalWeather(activeOrg?.city);

  const [previewResult, setPreviewResult] = useState<SimulationResult | null>(
    null,
  );
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);

  const simulationsQuery = useSimulations(orgId);
  const { runPreview, saveScenario } = useRunSimulation(orgId);
  const compareMutation = useCompareSimulations();

  const updateDraft = (partial: Partial<SimulationInputForm>) => {
    setSimulatorDraft(orgId, partial);
  };

  const handleRun = () => {
    const changes = {
      attendanceChange: draft.attendanceChange,
      productionChange: draft.productionChange,
      inventoryChange: draft.inventoryChange,
      ordersChange: draft.ordersChange,
      weatherImpact: draft.weatherImpact,
      eventImpact: draft.eventImpact,
      donationsChange: draft.donationsChange,
    };

    runPreview.mutate(changes, {
      onSuccess: (result) => {
        setPreviewResult(result);
        toast.success("Simulation complete");
      },
      onError: () => {
        toast.error("Simulation failed");
      },
    });
  };

  const handleSave = () => {
    saveScenario.mutate(
      {
        name: draft.name,
        changes: {
          attendanceChange: draft.attendanceChange,
          productionChange: draft.productionChange,
          inventoryChange: draft.inventoryChange,
          ordersChange: draft.ordersChange,
          weatherImpact: draft.weatherImpact,
          eventImpact: draft.eventImpact,
          donationsChange: draft.donationsChange,
        },
      },
      {
        onSuccess: () => {
          toast.success("Scenario saved");
        },
        onError: () => {
          toast.error("Failed to save scenario");
        },
      },
    );
  };

  const toggleCompareSelect = (id: string) => {
    setSelectedScenarioIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 2
          ? [...prev, id]
          : [prev[1], id];
      setCompareScenarioIds(orgId, next);
      return next;
    });
  };

  const handleCompare = () => {
    const ids = selectedScenarioIds.length >= 2
      ? selectedScenarioIds
      : compareIds;

    if (ids.length < 2) {
      toast.error("Select two scenarios to compare");
      return;
    }

    compareMutation.mutate(ids, {
      onError: () => {
        toast.error("Comparison failed");
      },
    });
  };

  const handleDuplicate = () => {
    updateDraft({
      name: `${draft.name} (copy)`,
    });
    toast.success("Scenario duplicated — adjust and save");
  };

  return (
    <div className="space-y-6">
      {weatherQuery.data && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Cloud className="h-3 w-3" aria-hidden />
            {weatherQuery.data.rainyDays} rainy days in forecast ·{" "}
            {weatherQuery.data.totalPrecipitationMm.toFixed(1)} mm precip
          </Badge>
        </div>
      )}
      <ScenarioInputPanel values={draft} onChange={updateDraft} />

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleRun} disabled={runPreview.isPending}>
          {runPreview.isPending ? "Running…" : "Run simulation"}
        </Button>
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={saveScenario.isPending}
        >
          Save scenario
        </Button>
        <Button variant="ghost" onClick={handleDuplicate}>
          Duplicate
        </Button>
      </div>

      <ScenarioResultsPanel
        result={previewResult}
        isLoading={runPreview.isPending}
      />

      <PredictionsQueryState
        query={simulationsQuery}
        emptyIcon={FlaskConical}
        emptyTitle="No saved scenarios"
        emptyDescription="Save scenarios to compare outcomes over time."
        isEmpty={(data) => data.length === 0}
      >
        {(simulations) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">Saved Scenarios</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCompare}
                disabled={
                  selectedScenarioIds.length < 2 && compareIds.length < 2
                }
              >
                Compare selected
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {simulations.map((sim) => (
                <ScenarioCard
                  key={sim.id}
                  simulation={sim}
                  selected={selectedScenarioIds.includes(sim.id)}
                  isWinner={
                    compareMutation.data?.winnerId === sim.id
                  }
                  onSelect={() => toggleCompareSelect(sim.id)}
                />
              ))}
            </div>
          </div>
        )}
      </PredictionsQueryState>

      <ScenarioComparisonView
        comparison={compareMutation.data ?? null}
        isLoading={compareMutation.isPending}
      />
    </div>
  );
}
