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
import type { OnboardingFormValues } from "@/features/organizations/schemas/organization.schema";

const PROFILES = [
  { value: "school", label: "School Cafeteria" },
  { value: "food_bank", label: "Food Bank" },
  { value: "community_kitchen", label: "Community Kitchen" },
  { value: "university", label: "University Dining" },
  { value: "corporate_cafeteria", label: "Corporate Cafeteria" },
];

export function OperationalProfileStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Operational profile</Label>
        <Select
          value={watch("operationalFocus")}
          onValueChange={(v) =>
            setValue("operationalFocus", v, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select profile" />
          </SelectTrigger>
          <SelectContent>
            {PROFILES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.operationalFocus && (
          <p className="text-sm text-destructive">
            {errors.operationalFocus.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="sitesCount">Number of sites</Label>
        <Input
          id="sitesCount"
          type="number"
          min={1}
          {...register("sitesCount")}
        />
      </div>
    </div>
  );
}
