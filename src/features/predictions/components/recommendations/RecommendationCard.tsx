"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/ai/AiBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { RecommendationActionBar } from "@/features/predictions/components/recommendations/RecommendationActionBar";
import type { Recommendation, RecommendationPriority } from "@/types/recommendation";

const PRIORITY_VARIANT: Record<
  RecommendationPriority,
  "default" | "warning" | "destructive" | "secondary"
> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "destructive",
};

interface RecommendationCardProps {
  orgId: string;
  recommendation: Recommendation;
  selected?: boolean;
  onSelect?: () => void;
  onAssign?: () => void;
}

export function RecommendationCard({
  orgId,
  recommendation,
  selected = false,
  onSelect,
  onAssign,
}: RecommendationCardProps) {
  return (
    <li
      className={`rounded-lg border bg-card p-4 space-y-3 ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <button
        type="button"
        className="w-full text-left"
        onClick={onSelect}
        aria-pressed={selected}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{recommendation.title}</p>
              <AiBadge />
            </div>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {recommendation.description}
            </p>
          </div>
          <Badge variant={PRIORITY_VARIANT[recommendation.priority]}>
            {recommendation.priority}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{recommendation.siteName}</span>
          <span>{recommendation.impact}</span>
          <ConfidenceIndicator
            value={Math.round(recommendation.confidence * 100)}
            showLabel={false}
          />
        </div>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <RecommendationActionBar
          orgId={orgId}
          recommendation={recommendation}
          compact
        />
        {onAssign && recommendation.status === "open" && (
          <Button size="sm" variant="outline" onClick={onAssign}>
            Assign
          </Button>
        )}
      </div>
    </li>
  );
}
