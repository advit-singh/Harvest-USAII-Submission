"use client";

import type { SimulationComparison } from "@/types/simulation";
import { ScenarioResultsPanel } from "@/features/predictions/components/simulator/ScenarioResultsPanel";

interface ScenarioComparisonViewProps {
  comparison: SimulationComparison | null;
  isLoading?: boolean;
}

export function ScenarioComparisonView({
  comparison,
  isLoading = false,
}: ScenarioComparisonViewProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Comparing scenarios…
      </div>
    );
  }

  if (!comparison) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Scenario Comparison</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        {comparison.simulations.map((sim) => (
          <div key={sim.id} className="space-y-2">
            <p className="text-sm font-medium">
              {sim.name}
              {sim.id === comparison.winnerId && (
                <span className="ml-2 text-primary">(Winner)</span>
              )}
            </p>
            <ScenarioResultsPanel result={sim.result} />
          </div>
        ))}
      </div>
    </div>
  );
}
