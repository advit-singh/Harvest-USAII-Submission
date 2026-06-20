"use client";

import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchFactorsPanel } from "@/features/rescue/components/matching/MatchFactorsPanel";
import type { DonationMatchCandidate } from "@/types/donation";

interface MatchCandidateCardProps {
  candidate: DonationMatchCandidate;
  rank: number;
  isSelected?: boolean;
  onSelect: (recipientId: string) => void;
}

export function MatchCandidateCard({
  candidate,
  rank,
  isSelected,
  onSelect,
}: MatchCandidateCardProps) {
  return (
    <Card className={isSelected ? "ring-2 ring-primary" : undefined}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div>
          <p className="text-xs text-muted-foreground">Rank #{rank}</p>
          <CardTitle className="text-base">{candidate.recipientName}</CardTitle>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{candidate.matchScore}</p>
          <p className="text-xs text-muted-foreground">match score</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ConfidenceIndicator
          value={Math.round(candidate.confidence * 100)}
        />

        <dl className="grid gap-1 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Distance</dt>
            <dd>{candidate.distanceKm} km</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Compatibility</dt>
            <dd>{candidate.compatibility}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Pickup</dt>
            <dd>{candidate.pickupAvailability}</dd>
          </div>
        </dl>

        <MatchFactorsPanel
          factors={candidate.factors}
          reasoning={candidate.reasoning}
        />

        <Button
          className="w-full"
          variant={isSelected ? "default" : "outline"}
          onClick={() => onSelect(candidate.recipientId)}
        >
          {isSelected ? "Selected" : "Select recipient"}
        </Button>
      </CardContent>
    </Card>
  );
}
