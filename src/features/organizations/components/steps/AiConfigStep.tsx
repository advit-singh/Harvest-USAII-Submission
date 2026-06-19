"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiBadge } from "@/components/ai/AiBadge";
import type { OnboardingFormValues } from "@/features/organizations/schemas/organization.schema";

export function AiConfigStep() {
  const { setValue, watch } = useFormContext<OnboardingFormValues>();

  return (
    <div className="space-y-6 rounded-lg border border-[var(--color-ai-border)] bg-[var(--color-ai-bg)] p-4">
      <div className="flex items-center gap-2">
        <AiBadge label="AI Configuration" />
        <p className="text-sm text-muted-foreground">
          Defaults are recommended. You can change these later in Settings.
        </p>
      </div>
      <div className="space-y-2">
        <Label>Recommendation aggressiveness</Label>
        <Select
          value={watch("recommendationAggressiveness")}
          onValueChange={(v) =>
            setValue(
              "recommendationAggressiveness",
              v as OnboardingFormValues["recommendationAggressiveness"],
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conservative">Conservative</SelectItem>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="aggressive">Aggressive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Default forecast horizon</Label>
        <Select
          value={watch("forecastHorizon")}
          onValueChange={(v) =>
            setValue("forecastHorizon", v as OnboardingFormValues["forecastHorizon"])
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="memoryEnabled"
          checked={watch("memoryEnabled")}
          onChange={(e) => setValue("memoryEnabled", e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="memoryEnabled">Enable organization memory</Label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="confidenceVisibility"
          checked={watch("confidenceVisibility")}
          onChange={(e) => setValue("confidenceVisibility", e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="confidenceVisibility">Show confidence scores</Label>
      </div>
    </div>
  );
}
