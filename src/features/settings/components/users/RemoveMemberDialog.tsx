"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRemoveMember } from "@/features/settings/hooks/useOrganizationMembers";
import type { OrganizationMember } from "@/types/organization";

interface RemoveMemberDialogProps {
  orgId: string;
  member: OrganizationMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveMemberDialog({
  orgId,
  member,
  open,
  onOpenChange,
}: RemoveMemberDialogProps) {
  const removeMutation = useRemoveMember(orgId);

  const handleRemove = async () => {
    if (!member) return;
    try {
      await removeMutation.mutateAsync(member.id);
      toast.success("Member removed");
      onOpenChange(false);
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove team member</DialogTitle>
          <DialogDescription>
            Remove {member?.email} from this organization? They will lose access
            immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={removeMutation.isPending}
          >
            Remove member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
