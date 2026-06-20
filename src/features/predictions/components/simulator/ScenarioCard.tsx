"use client";

import { Button } from "@/components/ui/button";
import type { Simulation } from "@/types/simulation";

interface ScenarioCardProps {
  simulation: Simulation;
  selected?: boolean;
  isWinner?: boolean;
  onSelect?: () => void;
  onRun?: () => void;
}

export function ScenarioCard({
  simulation,
  selected = false,
  isWinner = false,
  onSelect,
  onRun,
}: ScenarioCardProps) {
  return (
    <article
      className={`rounded-lg border bg-card p-4 ${
        selected ? "ring-2 ring-primary" : ""
      } ${isWinner ? "border-primary" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="text-left"
          onClick={onSelect}
          aria-pressed={selected}
        >
          <h3 className="font-medium">{simulation.name}</h3>
          <p className="text-xs text-muted-foreground">
            Created {new Date(simulation.createdAt).toLocaleDateString()}
          </p>
          {isWinner && (
            <p className="mt-1 text-xs font-medium text-primary">
              Best outcome
            </p>
          )}
        </button>
        {onRun && (
          <Button size="sm" variant="outline" onClick={onRun}>
            Run
          </Button>
        )}
      </div>
    </article>
  );
}
