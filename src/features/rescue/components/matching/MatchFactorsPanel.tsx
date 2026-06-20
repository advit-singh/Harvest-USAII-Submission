"use client";

import type { DonationMatchFactor } from "@/types/donation";
import { AiBadge } from "@/components/ai/AiBadge";

interface MatchFactorsPanelProps {
  factors: DonationMatchFactor[];
  reasoning?: string;
}

export function MatchFactorsPanel({
  factors,
  reasoning,
}: MatchFactorsPanelProps) {
  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <AiBadge />
        <h4 className="text-sm font-medium">Match reasoning</h4>
      </div>

      {reasoning && (
        <p className="text-sm text-muted-foreground">{reasoning}</p>
      )}

      <ul className="space-y-2" role="list">
        {factors.map((factor) => (
          <li
            key={factor.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{factor.label}</span>
            <span className="font-medium">{factor.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
