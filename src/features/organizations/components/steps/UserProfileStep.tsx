"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingFormValues } from "@/features/organizations/schemas/organization.schema";

export function UserProfileStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Tell us who you are. This helps personalize your Harvest experience.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
