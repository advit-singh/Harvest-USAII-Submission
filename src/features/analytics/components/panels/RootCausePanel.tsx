"use client";

import { AiBadge } from "@/components/ai/AiBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RootCauseAnalysis } from "@/types/analytics";

interface RootCausePanelProps {
  rootCause: RootCauseAnalysis;
}

export function RootCausePanel({ rootCause }: RootCausePanelProps) {
  if (rootCause.drivers.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Waste Increase Drivers</CardTitle>
          <AiBadge />
        </div>
        <p className="text-sm text-muted-foreground">{rootCause.summary}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">AI confidence</span>
          <ConfidenceIndicator
            value={Math.round(rootCause.confidence * 100)}
          />
        </div>
        <div className="space-y-3" role="list" aria-label="Root cause drivers">
          {rootCause.drivers.map((driver) => (
            <div key={driver.name} role="listitem">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{driver.name}</span>
                <span className="text-muted-foreground">{driver.percent}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={driver.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${driver.name}: ${driver.percent}%`}
              >
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                  style={{ width: `${driver.percent}%` }}
                />
              </div>
              {driver.description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {driver.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
