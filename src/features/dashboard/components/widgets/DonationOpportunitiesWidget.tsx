"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WidgetShell } from "@/features/dashboard/components/WidgetShell";
import { WidgetQueryState } from "@/features/dashboard/components/WidgetQueryState";
import { useDonationOpportunities } from "@/features/dashboard/hooks/useDonationOpportunities";
import type { DonationPriority } from "@/types/donation";

const PRIORITY_VARIANT: Record<
  DonationPriority,
  "default" | "warning" | "destructive"
> = {
  low: "default",
  medium: "warning",
  high: "destructive",
};

interface DonationOpportunitiesWidgetProps {
  orgId: string;
}

export function DonationOpportunitiesWidget({
  orgId,
}: DonationOpportunitiesWidgetProps) {
  const query = useDonationOpportunities(orgId);

  return (
    <WidgetShell
      widgetId="donation-opportunities"
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/rescue">View all</Link>
        </Button>
      }
    >
      <WidgetQueryState
        query={query}
        emptyIcon={HeartHandshake}
        emptyTitle="No donation opportunities"
        emptyDescription="Surplus items ready for rescue will appear here."
        isEmpty={(data) => data.length === 0}
      >
        {(opportunities) => (
          <ul className="space-y-2" role="list">
            {opportunities.slice(0, 3).map((opp) => (
              <li
                key={opp.id}
                className="flex items-start justify-between gap-2 rounded-md border p-2 text-sm"
              >
                <Link
                  href={`/rescue?tab=opportunities&id=${opp.id}`}
                  className="min-w-0 flex-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  <p className="font-medium truncate">{opp.item}</p>
                  <p className="text-xs text-muted-foreground">
                    {opp.quantity} · expires{" "}
                    {new Date(opp.expirationDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {opp.suggestedRecipientCount} potential recipients
                  </p>
                </Link>
                <Badge variant={PRIORITY_VARIANT[opp.priority]}>
                  {opp.priority}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </WidgetQueryState>
    </WidgetShell>
  );
}
