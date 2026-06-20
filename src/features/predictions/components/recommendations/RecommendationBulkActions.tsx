"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRecommendationAction } from "@/features/predictions/hooks/useRecommendationAction";
import type { Recommendation } from "@/types/recommendation";

interface RecommendationBulkActionsProps {
  orgId: string;
  selectedIds: string[];
  recommendations: Recommendation[];
  onClearSelection: () => void;
}

export function RecommendationBulkActions({
  orgId,
  selectedIds,
  recommendations,
  onClearSelection,
}: RecommendationBulkActionsProps) {
  const actionMutation = useRecommendationAction(orgId);

  if (selectedIds.length === 0) return null;

  const handleBulk = (action: "accepted" | "rejected" | "snoozed") => {
    const openRecs = recommendations.filter(
      (r) => selectedIds.includes(r.id) && r.status === "open",
    );

    if (openRecs.length === 0) {
      toast.error("No open recommendations selected");
      return;
    }

    Promise.all(
      openRecs.map((rec) =>
        actionMutation.mutateAsync({
          id: rec.id,
          input: { action },
        }),
      ),
    )
      .then(() => {
        toast.success(`${openRecs.length} recommendations updated`);
        onClearSelection();
      })
      .catch(() => {
        toast.error("Bulk action failed");
      });
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-3"
      role="toolbar"
      aria-label="Bulk recommendation actions"
    >
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>
      <Button
        size="sm"
        disabled={actionMutation.isPending}
        onClick={() => handleBulk("accepted")}
      >
        Accept all
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={actionMutation.isPending}
        onClick={() => handleBulk("rejected")}
      >
        Reject all
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={actionMutation.isPending}
        onClick={() => handleBulk("snoozed")}
      >
        Snooze all
      </Button>
      <Button size="sm" variant="ghost" onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
}
