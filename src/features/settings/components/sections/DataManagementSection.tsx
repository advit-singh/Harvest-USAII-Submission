"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { downloadOrgExport } from "@/lib/api/export";

interface DataManagementSectionProps {
  orgId: string;
}

export function DataManagementSection({ orgId }: DataManagementSectionProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await downloadOrgExport(orgId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `harvest-export-${orgId.slice(0, 8)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed", { description: "Please try again." });
    } finally {
      setExporting(false);
    }
  };

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
            support to adjust retention policies.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center">
          <Database className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium">Export organization data</p>
            <p className="text-xs text-muted-foreground">
              Download a CSV archive of uploads, inventory, and waste records
            </p>
          </div>
          <Button variant="outline" onClick={() => void handleExport()} disabled={exporting}>
            {exporting ? "Exporting…" : "Export"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
