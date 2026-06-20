"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsQueryState } from "@/features/settings/components/SettingsQueryState";
import {
  aiSettingsSchema,
  type AiSettingsInput,
} from "@/features/settings/schemas/ai-settings.schema";
import {
  useOrganizationSettings,
  useUpdateOrganizationSettings,
} from "@/features/settings/hooks/useOrganizationSettings";

interface AiSettingsSectionProps {
  orgId: string;
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border p-3">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border"
        aria-label={label}
      />
    </div>
  );
}

export function AiSettingsSection({ orgId }: AiSettingsSectionProps) {
  const settingsQuery = useOrganizationSettings(orgId);
  const updateMutation = useUpdateOrganizationSettings(orgId);

  const form = useForm<AiSettingsInput>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      confidenceVisibility: true,
      memoryEnabled: true,
      recommendationAggressiveness: "medium",
      assistantEnabled: true,
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      form.reset(settingsQuery.data.ai);
    }
  }, [settingsQuery.data, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ ai: values });
      toast.success("AI settings saved");
    } catch {
      toast.error("Failed to save AI settings");
    }
  });

  return (
    <SettingsQueryState query={settingsQuery}>
      {() => (
        <Card>
          <CardHeader>
            <CardTitle>AI settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ToggleRow
                id="ai-confidence"
                label="Show confidence scores"
                description="Display AI confidence on forecasts and recommendations"
                checked={form.watch("confidenceVisibility")}
                onChange={(v) => form.setValue("confidenceVisibility", v)}
              />
              <ToggleRow
                id="ai-memory"
                label="Organization memory"
                description="Learn naming conventions from corrections over time"
                checked={form.watch("memoryEnabled")}
                onChange={(v) => form.setValue("memoryEnabled", v)}
              />
              <ToggleRow
                id="ai-assistant"
                label="AI assistant"
                description="Allow team members to use the operations assistant"
                checked={form.watch("assistantEnabled")}
                onChange={(v) => form.setValue("assistantEnabled", v)}
              />
              <div className="space-y-2">
                <Label htmlFor="ai-aggressiveness">
                  Recommendation aggressiveness
                </Label>
                <Select
                  value={form.watch("recommendationAggressiveness")}
                  onValueChange={(v) =>
                    form.setValue(
                      "recommendationAggressiveness",
                      v as AiSettingsInput["recommendationAggressiveness"],
                    )
                  }
                >
                  <SelectTrigger id="ai-aggressiveness">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low — fewer suggestions</SelectItem>
                    <SelectItem value="medium">Medium — balanced</SelectItem>
                    <SelectItem value="high">High — proactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={updateMutation.isPending}>
                Save AI settings
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </SettingsQueryState>
  );
}
