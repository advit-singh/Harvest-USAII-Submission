"use client";

import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OpportunityPriorityBadge } from "@/features/rescue/components/opportunities/OpportunityPriorityBadge";
import type { DonationOpportunity } from "@/types/donation";

interface OpportunityCardProps {
  opportunity: DonationOpportunity;
  onReview: (id: string) => void;
  onMatch: (id: string) => void;
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
  isDismissing?: boolean;
}

function formatExpiration(date: string): string {
  const expires = new Date(date);
  const days = Math.ceil((expires.getTime() - Date.now()) / 86400000);
  if (days <= 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days} days`;
}

export function OpportunityCard({
  opportunity,
  onReview,
  onMatch,
  onComplete,
  onDismiss,
  isDismissing,
}: OpportunityCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="min-w-0">
          <CardTitle className="text-base">{opportunity.item}</CardTitle>
          <p className="text-sm text-muted-foreground">{opportunity.quantity}</p>
        </div>
        <OpportunityPriorityBadge
          priority={opportunity.priority}
          score={opportunity.priorityScore}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
            <dd>{formatExpiration(opportunity.expirationDate)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden />
            <dd>{opportunity.siteName}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
            <dd>
              {opportunity.suggestedRecipientCount} suggested recipients
            </dd>
          </div>
          <div>
            <dt className="sr-only">Predicted meals saved</dt>
            <dd className="font-medium text-[var(--color-success)]">
              ~{opportunity.predictedMealsSaved} meals rescued
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onReview(opportunity.id)}>
            Review
          </Button>
          <Button size="sm" onClick={() => onMatch(opportunity.id)}>
            Match
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onComplete(opportunity.id)}
          >
            Complete
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDismiss(opportunity.id)}
            disabled={isDismissing}
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
