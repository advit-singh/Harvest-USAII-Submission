"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceIndicator } from "@/components/ai/ConfidenceIndicator";
import { AnomalyCorrectionDialog } from "@/features/uploads/components/validation/AnomalyCorrectionDialog";
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
  const [correctOpen, setCorrectOpen] = useState(false);

  const handleAction = async (
    action: "accepted" | "corrected" | "ignored",
    correctedValue?: string,
  ) => {
    try {
      await resolveMutation.mutateAsync({
        anomalyId: anomaly.id,
        action,
        correctedValue,
      });
      const messages = {
        accepted: "Flag acknowledged as valid",
        corrected: "Value corrected and saved",
        ignored: "Anomaly dismissed",
      };
      toast.success(messages[action]);
    } catch {
      toast.error("Failed to update anomaly");
    }
  };

  return (
    <>
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
              Acknowledge
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={resolveMutation.isPending}
              onClick={() => setCorrectOpen(true)}
            >
              Correct
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={resolveMutation.isPending}
              onClick={() => void handleAction("ignored")}
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnomalyCorrectionDialog
        anomaly={anomaly}
        open={correctOpen}
        onOpenChange={setCorrectOpen}
        isSubmitting={resolveMutation.isPending}
        onSubmit={async (correctedValue) => {
          await handleAction("corrected", correctedValue);
        }}
      />
    </>
  );
}
