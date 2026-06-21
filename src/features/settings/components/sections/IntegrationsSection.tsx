"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plug, Webhook } from "lucide-react";
import { useOrganizationSettings } from "@/features/settings/hooks/useOrganizationSettings";

interface IntegrationsSectionProps {
  orgId: string;
}

export function IntegrationsSection({ orgId }: IntegrationsSectionProps) {
  const settingsQuery = useOrganizationSettings(orgId);
  const webhookUrl =
    (settingsQuery.data as { integrations?: { webhookUrl?: string } } | undefined)
      ?.integrations?.webhookUrl ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <Webhook className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">Webhook notifications</p>
              <p className="text-xs text-muted-foreground">
                {webhookUrl
                  ? `Configured: ${webhookUrl}`
                  : "No webhook configured. Contact your admin to set up event forwarding."}
              </p>
            </div>
          </div>
          <Badge variant={webhookUrl ? "default" : "secondary"}>
            {webhookUrl ? "Active" : "Not configured"}
          </Badge>
        </div>
        <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <Plug className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">Google Sheets</p>
              <p className="text-xs text-muted-foreground">
                Sync inventory and attendance spreadsheets automatically
              </p>
            </div>
          </div>
          <Badge variant="secondary">Planned</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect external data sources without changing your existing workflows.
          Google Sheets integration is on the roadmap for a future release.
        </p>
      </CardContent>
    </Card>
  );
}
