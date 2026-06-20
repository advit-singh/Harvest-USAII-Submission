"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SettingsQueryState } from "@/features/settings/components/SettingsQueryState";
import {
  notificationPreferencesSchema,
  type NotificationPreferencesInput,
} from "@/features/settings/schemas/notification-preferences.schema";
import {
  useOrganizationSettings,
  useUpdateOrganizationSettings,
} from "@/features/settings/hooks/useOrganizationSettings";
import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/features/notifications/hooks/notification-keys";

interface NotificationsPreferencesSectionProps {
  orgId: string;
}

function PrefToggle({
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

export function NotificationsPreferencesSection({
  orgId,
}: NotificationsPreferencesSectionProps) {
  const settingsQuery = useOrganizationSettings(orgId);
  const updateMutation = useUpdateOrganizationSettings(orgId);
  const queryClient = useQueryClient();

  const form = useForm<NotificationPreferencesInput>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      critical: true,
      warning: true,
      informational: true,
      emailDigest: false,
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      form.reset(settingsQuery.data.notifications);
    }
  }, [settingsQuery.data, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ notifications: values });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(orgId),
      });
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save notification preferences");
    }
  });

  return (
    <SettingsQueryState query={settingsQuery}>
      {() => (
        <Card>
          <CardHeader>
            <CardTitle>Notification preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <PrefToggle
                id="notif-critical"
                label="Critical alerts"
                description="Validation warnings and urgent waste risks"
                checked={form.watch("critical")}
                onChange={(v) => form.setValue("critical", v)}
              />
              <PrefToggle
                id="notif-warning"
                label="Warnings"
                description="Forecast updates and assignments"
                checked={form.watch("warning")}
                onChange={(v) => form.setValue("warning", v)}
              />
              <PrefToggle
                id="notif-info"
                label="Informational"
                description="Upload completions and donation updates"
                checked={form.watch("informational")}
                onChange={(v) => form.setValue("informational", v)}
              />
              <PrefToggle
                id="notif-email"
                label="Weekly email digest"
                description="Summary of activity and impact"
                checked={form.watch("emailDigest")}
                onChange={(v) => form.setValue("emailDigest", v)}
              />
              <Button type="submit" disabled={updateMutation.isPending}>
                Save preferences
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </SettingsQueryState>
  );
}
