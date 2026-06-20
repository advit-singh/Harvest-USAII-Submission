"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { useResolveAnomaly } from "@/features/uploads/hooks/useUploads";
import type { ValidationAnomaly } from "@/types/upload";
import { toast } from "sonner";

interface AnomalyCardProps {
  anomaly: ValidationAnomaly;
  fileName?: string;
  orgId: string;
}

const SEVERITY_VARIANT = {
  critical: "destructive",
  warning: "warning",
  informational: "secondary",
} as const;

export function AnomalyCard({ anomaly, fileName, orgId }: AnomalyCardProps) {
  const resolveMutation = useResolveAnomaly(orgId);

  const handleAction = async (action: "accepted" | "corrected" | "ignored") => {
    try {
      await resolveMutation.mutateAsync({ anomalyId: anomaly.id, action });
      toast.success(`Anomaly ${action}`);
    } catch {
      toast.error("Failed to update anomaly");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">
            {anomaly.type.replace(/_/g, " ")}
          </CardTitle>
          <Badge variant={SEVERITY_VARIANT[anomaly.severity]}>
            {anomaly.severity}
          </Badge>
        </div>
        {fileName && (
          <p className="text-xs text-muted-foreground">From: {fileName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{anomaly.reason}</p>
        <ConfidenceIndicator value={Math.round(anomaly.confidence * 100)} />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Suggested fix:</span> {anomaly.suggestedFix}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={resolveMutation.isPending}
            onClick={() => void handleAction("accepted")}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={resolveMutation.isPending}
            onClick={() => void handleAction("corrected")}
          >
            Correct
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={resolveMutation.isPending}
            onClick={() => void handleAction("ignored")}
          >
            Ignore
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
