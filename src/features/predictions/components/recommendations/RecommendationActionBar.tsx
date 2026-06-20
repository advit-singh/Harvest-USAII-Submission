"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRecommendationAction } from "@/features/predictions/hooks/useRecommendationAction";
import type { Recommendation } from "@/types/recommendation";

interface RecommendationActionBarProps {
  orgId: string;
  recommendation: Recommendation;
  compact?: boolean;
  onActionComplete?: () => void;
}

export function RecommendationActionBar({
  orgId,
  recommendation,
  compact = false,
  onActionComplete,
}: RecommendationActionBarProps) {
  const actionMutation = useRecommendationAction(orgId);

  const handleAction = (
    action: "accepted" | "rejected" | "snoozed" | "completed",
  ) => {
    actionMutation.mutate(
      { id: recommendation.id, input: { action } },
      {
        onSuccess: () => {
          const labels = {
            accepted: "accepted",
            rejected: "rejected",
            snoozed: "snoozed",
            completed: "completed",
          };
          toast.success(`Recommendation ${labels[action]}`, {
            description: recommendation.title,
          });
          onActionComplete?.();
        },
        onError: () => {
          toast.error("Action failed", { description: "Please try again." });
        },
      },
    );
  };

  if (recommendation.status !== "open") {
    return (
      <Badge variant="secondary" className="capitalize">
        {recommendation.status}
      </Badge>
    );
  }

  return (
    <div className={compact ? "flex flex-wrap gap-1" : "flex flex-wrap gap-2"}>
      <Button
        size="sm"
        disabled={actionMutation.isPending}
        onClick={() => handleAction("accepted")}
      >
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={actionMutation.isPending}
        onClick={() => handleAction("rejected")}
      >
        Reject
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={actionMutation.isPending}
        onClick={() => handleAction("snoozed")}
      >
        Snooze
      </Button>
      {!compact && (
        <Button
          size="sm"
          variant="secondary"
          disabled={actionMutation.isPending}
          onClick={() => handleAction("completed")}
        >
          Mark complete
        </Button>
      )}
    </div>
  );
}
