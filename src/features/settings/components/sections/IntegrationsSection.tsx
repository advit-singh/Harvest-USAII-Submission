"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plug } from "lucide-react";

interface IntegrationsSectionProps {
  orgId: string;
}

export function IntegrationsSection({ orgId }: IntegrationsSectionProps) {
  void orgId;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-md border p-4">
          <div className="flex gap-3">
            <Plug className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">Google Sheets</p>
              <p className="text-xs text-muted-foreground">
                Sync inventory and attendance spreadsheets automatically
              </p>
            </div>
          </div>
          <Badge variant="secondary">Coming soon</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          MVP integrations will appear here. Connect data sources without
          changing your existing workflows.
        </p>
        <Button variant="outline" disabled>
          Connect integration
        </Button>
      </CardContent>
    </Card>
  );
}
