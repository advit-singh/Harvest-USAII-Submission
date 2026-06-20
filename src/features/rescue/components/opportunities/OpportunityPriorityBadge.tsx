import type { DonationPriority } from "@/types/donation";
import { Badge } from "@/components/ui/badge";

const PRIORITY_VARIANT: Record<
  DonationPriority,
  "default" | "warning" | "destructive"
> = {
  low: "default",
  medium: "warning",
  high: "destructive",
};

interface OpportunityPriorityBadgeProps {
  priority: DonationPriority;
  score?: number;
}

export function OpportunityPriorityBadge({
  priority,
  score,
}: OpportunityPriorityBadgeProps) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]} className="shrink-0">
      {priority}
      {score !== undefined && (
        <span className="ml-1 opacity-80">({score})</span>
      )}
    </Badge>
  );
}
