"use client";

import { useEffect, useState } from "react";
import { Bell, Calendar, Cloud, Webhook } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useOrganizationSettings } from "@/features/settings/hooks/useOrganizationSettings";
import { updateOrganizationSettings } from "@/lib/api/organization-settings";
import { useExternalHolidays, useExternalWeather } from "@/features/intelligence/hooks/useExternalData";
import { useOrganizations } from "@/features/organizations/hooks/useOrganizations";
import { getOrgMeta, setOrgMeta } from "@/lib/demo/mock-persistence";

interface IntegrationsSectionProps {
  orgId: string;
}

export function IntegrationsSection({ orgId }: IntegrationsSectionProps) {
  const settingsQuery = useOrganizationSettings(orgId);
  const { activeOrg } = useOrganizations();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWebhookUrl(getOrgMeta(orgId).webhookUrl ?? "");
  }, [orgId]);

  const weatherQuery = useExternalWeather(activeOrg?.city);
  const holidaysQuery = useExternalHolidays(activeOrg?.country ?? "US");

  const externalEnabled = settingsQuery.data?.forecast.externalDataEnabled ?? false;

  const toggleExternalData = async (enabled: boolean) => {
    setSaving(true);
    try {
      await updateOrganizationSettings(orgId, {
        forecast: { externalDataEnabled: enabled },
      });
      await settingsQuery.refetch();
      toast.success(enabled ? "External data enabled" : "External data disabled");
    } catch {
      toast.error("Failed to update integration");
    } finally {
      setSaving(false);
    }
  };

  const saveWebhook = () => {
    setOrgMeta(orgId, { webhookUrl: webhookUrl.trim() });
    toast.success("Webhook URL saved");
  };

  const testWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Enter a webhook URL first");
      return;
    }
    setOrgMeta(orgId, { webhookUrl: webhookUrl.trim() });
    try {
      const response = await fetch(webhookUrl.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "harvest.test",
          orgId,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      toast.success("Test event sent");
    } catch {
      toast.error("Webhook test failed — URL saved for later retries");
    }
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Browser notifications are not supported");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Harvest", { body: "Notifications are enabled for this device." });
      toast.success("Notifications enabled");
    } else {
      toast.error("Notification permission denied");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Cloud className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">Weather and holidays (Open-Meteo, Nager.Date)</p>
              <p className="text-xs text-muted-foreground">
                {weatherQuery.data
                  ? `${weatherQuery.data.rainyDays} rainy days forecast · no API key required`
                  : "Live weather and holiday data for forecasts and simulations"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={externalEnabled}
              disabled={saving}
              onCheckedChange={(v) => void toggleExternalData(v)}
              aria-label="Toggle external weather and holiday data"
            />
            <Badge variant={externalEnabled ? "default" : "secondary"}>
              {externalEnabled ? "Active" : "Off"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">Upcoming holidays</p>
              <p className="text-xs text-muted-foreground">
                {holidaysQuery.data?.length
                  ? `${holidaysQuery.data.length} holidays in the next 30 days`
                  : "Loading public holiday calendar…"}
              </p>
            </div>
          </div>
          <Badge variant="secondary">No API key</Badge>
        </div>

        <div className="space-y-3 rounded-md border p-4">
          <div className="flex gap-3">
            <Webhook className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Webhook notifications</p>
              <Label htmlFor="webhook-url" className="sr-only">
                Webhook URL
              </Label>
              <Input
                id="webhook-url"
                placeholder="https://your-endpoint.example/harvest"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={saveWebhook}>
                  Save URL
                </Button>
                <Button size="sm" variant="outline" onClick={() => void testWebhook()}>
                  Send test event
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Bell className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">Browser notifications</p>
              <p className="text-xs text-muted-foreground">
                Get alerts for critical waste risks on this device
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => void requestNotifications()}>
            Enable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
