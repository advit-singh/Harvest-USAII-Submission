"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoles } from "@/features/organizations/hooks/useOrganizations";
import { LoadingState } from "@/components/feedback/LoadingState";
import type { OnboardingFormValues } from "@/features/organizations/schemas/organization.schema";

export function InviteTeamStep() {
  const { register, setValue, watch } = useFormContext<OnboardingFormValues>();
  const { data: roles, isLoading } = useRoles();
  const invites = watch("invites");

  if (isLoading) return <LoadingState rows={2} />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Invite team members now or skip and do this later in Settings.
      </p>
      {invites.map((_, index) => (
        <div key={index} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`invite-email-${index}`}>Email (optional)</Label>
            <Input
              id={`invite-email-${index}`}
              type="email"
              {...register(`invites.${index}.email`)}
              placeholder="colleague@school.edu"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={invites[index]?.roleId ?? "role_viewer"}
              onValueChange={(v) =>
                setValue(`invites.${index}.roleId`, v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles?.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}
