"use client";

import { AiBadge } from "@/components/ai/AiBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import type { SimulationResult } from "@/types/simulation";

interface ScenarioResultsPanelProps {
  result: SimulationResult | null;
  isLoading?: boolean;
}

export function ScenarioResultsPanel({
  result,
  isLoading = false,
}: ScenarioResultsPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 animate-pulse">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
        Adjust inputs and run a simulation to see projected outcomes.
      </div>
    );
  }

  const metrics = [
    {
      label: "Waste change",
      value: `${result.wasteChange > 0 ? "+" : ""}${result.wasteChange} meals`,
    },
    { label: "Cost savings", value: `$${result.costSavings}` },
    { label: "Shortage risk", value: `${Math.round(result.shortageRisk)}%` },
    {
      label: "Environmental impact",
      value: `${result.environmentalImpact} kg CO₂e avoided`,
    },
    { label: "Predicted surplus", value: `${result.predictedSurplus} meals` },
    {
      label: "Waste reduction",
      value: `${result.wasteReduction} meals prevented`,
    },
  ];

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Simulation Results</h3>
          <AiBadge />
        </div>
        <ConfidenceIndicator
          value={Math.round(result.confidence * 100)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
