"use client";

import type { ForecastFactor } from "@/types/forecast";
import { AiBadge } from "@/components/ai/AiBadge";

interface ForecastFactorsPanelProps {
  factors: ForecastFactor[];
}

export function ForecastFactorsPanel({ factors }: ForecastFactorsPanelProps) {
  if (factors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No contributing factors available for this forecast.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">Forecast Factors</h3>
        <AiBadge />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-3 py-2 font-medium" scope="col">
                Factor
              </th>
              <th className="px-3 py-2 font-medium" scope="col">
                Impact Weight
              </th>
              <th className="px-3 py-2 font-medium" scope="col">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {factors.map((factor) => (
              <tr key={factor.name} className="border-b last:border-0">
                <td className="px-3 py-2 font-medium">{factor.name}</td>
                <td className="px-3 py-2">
                  {Math.round(factor.impactWeight * 100)}%
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {factor.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
