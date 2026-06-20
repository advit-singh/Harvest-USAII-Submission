"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  donationCompletionSchema,
  type DonationCompletionFormInput,
} from "@/features/rescue/schemas/donation-completion.schema";
import { useCompleteDonation } from "@/features/rescue/hooks/useDonationComplete";
import type { DonationHistoryFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";
import { toast } from "sonner";

interface CompleteDonationDrawerProps {
  orgId: string;
  opportunityId: string | null;
  recipientId: string | null;
  recipientName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyFilters: DonationHistoryFiltersInput;
  onSuccess: () => void;
  onReportFailure: () => void;
}

export function CompleteDonationDrawer({
  orgId,
  opportunityId,
  recipientId,
  recipientName,
  open,
  onOpenChange,
  historyFilters,
  onSuccess,
  onReportFailure,
}: CompleteDonationDrawerProps) {
  const [confirmed, setConfirmed] = useState(false);
  const completeMutation = useCompleteDonation(orgId, historyFilters);

  const form = useForm<DonationCompletionFormInput>({
    resolver: zodResolver(donationCompletionSchema),
    defaultValues: {
      recipientId: recipientId ?? "",
      notes: "",
      confirmedByUser: true,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!opportunityId || !recipientId || !confirmed) {
      form.setError("confirmedByUser", {
        message: "You must confirm human approval",
      });
      return;
    }

    try {
      const result = await completeMutation.mutateAsync({
        opportunityId,
        payload: {
          recipientId: values.recipientId,
          notes: values.notes,
          confirmedByUser: true,
        },
      });

      toast.success("Donation completed", {
        description: `${result.impactDelta.mealsSaved} meals rescued.`,
      });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to complete donation");
    }
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Complete donation</DrawerTitle>
          <p className="text-sm text-muted-foreground">
            Confirm human approval before recording this donation.
          </p>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
          <input type="hidden" {...form.register("recipientId")} value={recipientId ?? ""} />

          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium">Recipient</p>
            <p className="text-sm text-muted-foreground">
              {recipientName ?? "Select a recipient from match review"}
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="completion-notes">Notes (optional)</Label>
            <Input
              id="completion-notes"
              placeholder="Pickup instructions or notes…"
              {...form.register("notes")}
            />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              I confirm this donation has been approved and transferred by a
              human coordinator.
            </span>
          </label>
          {form.formState.errors.confirmedByUser && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmedByUser.message}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              className="flex-1"
              disabled={!recipientId || completeMutation.isPending}
            >
              {completeMutation.isPending ? "Completing…" : "Complete donation"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onReportFailure}
            >
              Report failure
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
