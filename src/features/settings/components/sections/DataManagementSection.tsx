"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

interface DataManagementSectionProps {
  orgId: string;
}

export function DataManagementSection({ orgId }: DataManagementSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium">Data retention</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational records are retained for 24 months by default. Contact
            support to adjust retention for {orgId}.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-md border p-4">
          <Database className="h-5 w-5 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">Export organization data</p>
            <p className="text-xs text-muted-foreground">
              Download a CSV archive of uploads, inventory, and waste records
            </p>
          </div>
          <Button variant="outline" disabled>
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
