"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/features/settings/schemas/invite-member.schema";
import { useInviteMember } from "@/features/settings/hooks/useOrganizationMembers";
import { useRoles } from "@/features/organizations/hooks/useOrganizations";

interface InviteMemberDialogProps {
  orgId: string;
}

export function InviteMemberDialog({ orgId }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const inviteMutation = useInviteMember(orgId);
  const rolesQuery = useRoles();

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", roleId: "" },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await inviteMutation.mutateAsync(values);
      toast.success("Invitation sent");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Failed to invite member");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" aria-hidden />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={form.watch("roleId")}
              onValueChange={(v) => form.setValue("roleId", v)}
            >
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {(rolesQuery.data ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.roleId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.roleId.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={inviteMutation.isPending}>
            Send invitation
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
