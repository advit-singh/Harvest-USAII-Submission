"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  donationFailureSchema,
  type DonationFailureFormInput,
} from "@/features/rescue/schemas/donation-completion.schema";
import { useRecordDonationFailure } from "@/features/rescue/hooks/useDonationComplete";
import type { DonationHistoryFiltersInput } from "@/features/rescue/schemas/rescue-filters.schema";
import { toast } from "sonner";

const FAILURE_REASONS = [
  "Recipient unavailable",
  "Food expired",
  "Capacity exceeded",
  "Transportation issue",
];

interface DonationFailureDialogProps {
  orgId: string;
  opportunityId: string | null;
  recipientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyFilters: DonationHistoryFiltersInput;
  onSuccess: () => void;
}

export function DonationFailureDialog({
  orgId,
  opportunityId,
  recipientId,
  open,
  onOpenChange,
  historyFilters,
  onSuccess,
}: DonationFailureDialogProps) {
  const failureMutation = useRecordDonationFailure(orgId, historyFilters);

  const form = useForm<DonationFailureFormInput>({
    resolver: zodResolver(donationFailureSchema),
    defaultValues: { reason: "" },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!opportunityId || !recipientId) return;

    try {
      await failureMutation.mutateAsync({
        opportunityId,
        recipientId,
        reason: values.reason,
      });
      toast.info("Failure recorded", {
        description: "The opportunity has been updated for review.",
      });
      onOpenChange(false);
      form.reset();
      onSuccess();
    } catch {
      toast.error("Failed to record failure");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report donation failure</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Common reasons</Label>
            <div className="flex flex-wrap gap-2">
              {FAILURE_REASONS.map((reason) => (
                <Button
                  key={reason}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => form.setValue("reason", reason)}
                >
                  {reason}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="failure-reason">Reason</Label>
            <textarea
              id="failure-reason"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("reason")}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="destructive"
            disabled={failureMutation.isPending}
            className="w-full"
          >
            Record failure
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
