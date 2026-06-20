"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/ai/AiBadge";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { WidgetShell } from "@/features/dashboard/components/WidgetShell";
import { WidgetQueryState } from "@/features/dashboard/components/WidgetQueryState";
import {
  useRecommendationAction,
  useRecommendations,
} from "@/features/dashboard/hooks/useRecommendations";
import type { RecommendationPriority } from "@/types/recommendation";

const PRIORITY_VARIANT: Record<
  RecommendationPriority,
  "default" | "warning" | "destructive" | "secondary"
> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "destructive",
};

interface RecommendationsWidgetProps {
  orgId: string;
}

export function RecommendationsWidget({ orgId }: RecommendationsWidgetProps) {
  const query = useRecommendations(orgId, 3);
  const actionMutation = useRecommendationAction(orgId);

  const handleAction = (
    id: string,
    action: "accepted" | "rejected" | "snoozed",
    title: string,
  ) => {
    actionMutation.mutate(
      { id, input: { action } },
      {
        onSuccess: () => {
          const labels = {
            accepted: "accepted",
            rejected: "rejected",
            snoozed: "snoozed",
          };
          toast.success(`Recommendation ${labels[action]}`, {
            description: title,
          });
        },
        onError: () => {
          toast.error("Action failed", {
            description: "Please try again.",
          });
        },
      },
    );
  };

  return (
    <WidgetShell
      widgetId="recommendations"
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/predictions?tab=recommendations">View all</Link>
        </Button>
      }
    >
      <WidgetQueryState
        query={query}
        emptyIcon={Sparkles}
        emptyTitle="No recommendations"
        emptyDescription="Recommendations appear after forecasts are generated."
        isEmpty={(data) => data.length === 0}
      >
        {(recommendations) => (
          <ul className="space-y-3" role="list">
            {recommendations.map((rec) => (
              <li
                key={rec.id}
                className="rounded-lg border bg-card p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm">{rec.title}</p>
                      <AiBadge />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {rec.description}
                    </p>
                  </div>
                  <Badge variant={PRIORITY_VARIANT[rec.priority]}>
                    {rec.priority}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{rec.impact}</span>
                    <ConfidenceIndicator
                      value={Math.round(rec.confidence * 100)}
                      showLabel={false}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={actionMutation.isPending}
                      onClick={() =>
                        handleAction(rec.id, "accepted", rec.title)
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionMutation.isPending}
                      onClick={() =>
                        handleAction(rec.id, "rejected", rec.title)
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={actionMutation.isPending}
                      onClick={() => handleAction(rec.id, "snoozed", rec.title)}
                    >
                      Snooze
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </WidgetQueryState>
    </WidgetShell>
  );
}
