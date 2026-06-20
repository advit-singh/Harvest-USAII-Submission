"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import type { ExtractedEntity } from "@/types/upload";

interface ExtractedEntitiesTableProps {
  entities: ExtractedEntity[];
  editable?: boolean;
  values?: Record<string, string>;
  onValueChange?: (id: string, value: string) => void;
}

export function ExtractedEntitiesTable({
  entities,
  editable = false,
  values,
  onValueChange,
}: ExtractedEntitiesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Extracted entities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entities.map((entity) => (
          <div key={entity.id} className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor={`entity-${entity.id}`}>{entity.field}</Label>
              <ConfidenceIndicator
                value={Math.round(entity.confidence * 100)}
                showLabel={false}
              />
            </div>
            {editable && entity.editable && onValueChange ? (
              <Input
                id={`entity-${entity.id}`}
                value={values?.[entity.id] ?? entity.value}
                onChange={(e) => onValueChange(entity.id, e.target.value)}
              />
            ) : (
              <p className="text-sm">{entity.value}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
