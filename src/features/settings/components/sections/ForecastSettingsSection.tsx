"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsQueryState } from "@/features/settings/components/SettingsQueryState";
import {
  useOrganizationSettings,
  useUpdateOrganizationSettings,
} from "@/features/settings/hooks/useOrganizationSettings";

const forecastSettingsSchema = z.object({
  defaultHorizonDays: z.coerce.number().min(1).max(90),
  externalDataEnabled: z.boolean(),
});

type ForecastSettingsInput = z.infer<typeof forecastSettingsSchema>;

interface ForecastSettingsSectionProps {
  orgId: string;
}

export function ForecastSettingsSection({ orgId }: ForecastSettingsSectionProps) {
  const settingsQuery = useOrganizationSettings(orgId);
  const updateMutation = useUpdateOrganizationSettings(orgId);

  const form = useForm<ForecastSettingsInput>({
    resolver: zodResolver(forecastSettingsSchema),
    defaultValues: { defaultHorizonDays: 7, externalDataEnabled: true },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      form.reset(settingsQuery.data.forecast);
    }
  }, [settingsQuery.data, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ forecast: values });
      toast.success("Forecast settings saved");
    } catch {
      toast.error("Failed to save forecast settings");
    }
  });

  return (
    <SettingsQueryState query={settingsQuery}>
      {() => (
        <Card>
          <CardHeader>
            <CardTitle>Forecasting</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forecast-horizon">Default forecast horizon (days)</Label>
                <Input
                  id="forecast-horizon"
                  type="number"
                  min={1}
                  max={90}
                  {...form.register("defaultHorizonDays")}
                />
              </div>
              <div className="flex items-start justify-between gap-4 rounded-md border p-3">
                <div>
                  <Label htmlFor="forecast-external" className="text-sm font-medium">
                    External data sources
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Include weather, calendars, and holidays in forecasts
                  </p>
                </div>
                <input
                  id="forecast-external"
                  type="checkbox"
                  checked={form.watch("externalDataEnabled")}
                  onChange={(e) =>
                    form.setValue("externalDataEnabled", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border"
                  aria-label="External data sources"
                />
              </div>
              <Button type="submit" disabled={updateMutation.isPending}>
                Save forecast settings
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </SettingsQueryState>
  );
}
