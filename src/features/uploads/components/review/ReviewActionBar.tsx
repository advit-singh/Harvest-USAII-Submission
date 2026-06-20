"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApproveUpload, useRejectUpload } from "@/features/uploads/hooks/useUploads";
import { rejectUploadSchema } from "@/features/uploads/schemas/upload-review.schema";
import type { ExtractedEntity } from "@/types/upload";

interface ReviewActionBarProps {
  uploadId: string;
  entities: ExtractedEntity[];
  entityValues: Record<string, string>;
  onSuccess: () => void;
  onEditModeChange: (editing: boolean) => void;
  isEditing: boolean;
}

export function ReviewActionBar({
  uploadId,
  entities,
  entityValues,
  onSuccess,
  onEditModeChange,
  isEditing,
}: ReviewActionBarProps) {
  const approveMutation = useApproveUpload();
  const rejectMutation = useRejectUpload();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async () => {
    try {
      const edits = entities
        .filter((e) => entityValues[e.id] !== e.value)
        .map((e) => ({ id: e.id, value: entityValues[e.id] }));

      await approveMutation.mutateAsync({
        uploadId,
        payload: edits.length ? { entities: edits } : undefined,
      });
      toast.success("Upload approved and committed");
      onSuccess();
    } catch {
      toast.error("Failed to approve upload");
    }
  };

  const handleReject = async () => {
    const parsed = rejectUploadSchema.safeParse({ reason: rejectReason });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid reason");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        uploadId,
        payload: { reason: parsed.data.reason },
      });
      toast.success("Upload rejected");
      setRejectOpen(false);
      setRejectReason("");
      onSuccess();
    } catch {
      toast.error("Failed to reject upload");
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!isEditing ? (
          <Button variant="outline" onClick={() => onEditModeChange(true)}>
            Edit extraction
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onEditModeChange(false)}>
            Done editing
          </Button>
        )}
        <Button
          onClick={() => void handleApprove()}
          disabled={approveMutation.isPending}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => setRejectOpen(true)}
          disabled={rejectMutation.isPending}
        >
          Reject
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject upload</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this extraction is being rejected"
            />
          </div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => void handleReject()}
            disabled={rejectMutation.isPending}
          >
            Confirm rejection
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
