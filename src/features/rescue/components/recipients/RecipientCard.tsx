"use client";

import { MapPin, Clock, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Recipient } from "@/types/recipient";

const TYPE_LABELS: Record<Recipient["type"], string> = {
  food_bank: "Food Bank",
  shelter: "Shelter",
  community_fridge: "Community Fridge",
  school: "School",
  community_kitchen: "Community Kitchen",
  religious_org: "Religious Organization",
};

interface RecipientCardProps {
  recipient: Recipient;
}

export function RecipientCard({ recipient }: RecipientCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{recipient.name}</CardTitle>
          <Badge variant="outline" className="mt-1">
            {TYPE_LABELS[recipient.type]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {recipient.distanceKm} km
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <Utensils className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span>Capacity: {recipient.capacityMeals} meals</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span>{recipient.operatingHours}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <span>{recipient.address ?? recipient.availability}</span>
        </div>
        <p className="text-muted-foreground">
          Accepts: {recipient.foodTypesAccepted.join(", ")}
        </p>
      </CardContent>
    </Card>
  );
}
