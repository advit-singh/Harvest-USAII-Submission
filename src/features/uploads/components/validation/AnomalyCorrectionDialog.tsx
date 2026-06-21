"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ValidationAnomaly } from "@/types/upload";

interface AnomalyCorrectionDialogProps {
  anomaly: ValidationAnomaly | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (correctedValue: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function AnomalyCorrectionDialog({
  anomaly,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AnomalyCorrectionDialogProps) {
  const { register, handleSubmit, reset } = useForm<{ correctedValue: string }>({
    defaultValues: { correctedValue: "" },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  if (!anomaly) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Correct flagged value</DialogTitle>
          <DialogDescription>
            {anomaly.reason}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (data) => {
            await onSubmit(data.correctedValue);
            reset();
            onOpenChange(false);
          })}
        >
          <div className="space-y-2 py-2">
            <Label htmlFor="correctedValue">Corrected value</Label>
            <Input
              id="correctedValue"
              placeholder={anomaly.suggestedFix}
              {...register("correctedValue", { required: true })}
            />
            <p className="text-xs text-muted-foreground">
              Suggested: {anomaly.suggestedFix}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save correction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
