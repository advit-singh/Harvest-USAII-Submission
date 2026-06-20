"use client";

import { useEffect } from "react";
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
import { useOrganizationSettings } from "@/features/settings/hooks/useOrganizationSettings";
import { useUiStore } from "@/store/ui-store";
import {
  useDashboardStore,
  DEFAULT_LAYOUTS,
  DEFAULT_VISIBILITY,
} from "@/store/dashboard-store";
import type { WidgetId } from "@/types/dashboard";

const WIDGET_LABELS: Record<WidgetId, string> = {
  "waste-risk": "Waste risk",
  "predicted-surplus": "Predicted surplus",
  recommendations: "Recommendations",
  "inventory-health": "Inventory health",
  "impact-snapshot": "Impact snapshot",
  "donation-opportunities": "Donation opportunities",
  "recent-activity": "Recent activity",
};

interface AppearanceSectionProps {
  orgId: string;
}

export function AppearanceSection({ orgId }: AppearanceSectionProps) {
  const settingsQuery = useOrganizationSettings(orgId);
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed);
  const tableDensity = useUiStore((s) => s.tableDensity);
  const setTableDensity = useUiStore((s) => s.setTableDensity);
  const layout = useDashboardStore((s) => s.getLayoutForOrg(orgId));
  const setWidgetVisibility = useDashboardStore((s) => s.setWidgetVisibility);
  const resetLayout = useDashboardStore((s) => s.resetLayout);

  useEffect(() => {
    if (settingsQuery.data?.dashboardLayout) {
      // Layout persisted in org settings is available for future sync
    }
  }, [settingsQuery.data]);

  const handleResetLayout = () => {
    resetLayout(orgId);
    toast.success("Dashboard layout reset to default");
  };

  return (
    <SettingsQueryState query={settingsQuery}>
      {() => (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme & layout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appearance-theme">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={(v) =>
                    setTheme(v as "light" | "dark" | "system")
                  }
                >
                  <SelectTrigger id="appearance-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="sidebar-collapsed" className="text-sm font-medium">
                    Collapsed sidebar by default
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Start with a narrower navigation rail
                  </p>
                </div>
                <input
                  id="sidebar-collapsed"
                  type="checkbox"
                  checked={sidebarCollapsed}
                  onChange={(e) => setSidebarCollapsed(e.target.checked)}
                  className="h-4 w-4 rounded border"
                  aria-label="Collapsed sidebar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="table-density">Table density</Label>
                <Select
                  value={tableDensity}
                  onValueChange={(v) =>
                    setTableDensity(v as "comfortable" | "compact")
                  }
                >
                  <SelectTrigger id="table-density">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Dashboard widgets</CardTitle>
              <Button variant="outline" size="sm" onClick={handleResetLayout}>
                Reset layout
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {(Object.keys(WIDGET_LABELS) as WidgetId[]).map((widgetId) => (
                <div
                  key={widgetId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <Label htmlFor={`widget-${widgetId}`} className="text-sm">
                    {WIDGET_LABELS[widgetId]}
                  </Label>
                  <input
                    id={`widget-${widgetId}`}
                    type="checkbox"
                    checked={layout.visibility[widgetId]}
                    onChange={(e) =>
                      setWidgetVisibility(orgId, widgetId, e.target.checked)
                    }
                    className="h-4 w-4 rounded border"
                    aria-label={`Show ${WIDGET_LABELS[widgetId]} widget`}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Layout uses {layout.layouts.length} of{" "}
                {DEFAULT_LAYOUTS.length} default positions. Hidden widgets are
                removed from the dashboard grid.
              </p>
              <p className="text-xs text-muted-foreground">
                Visible widgets:{" "}
                {Object.values(layout.visibility).filter(Boolean).length} /{" "}
                {Object.keys(DEFAULT_VISIBILITY).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </SettingsQueryState>
  );
}
