"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout/legacy";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDashboardLayout } from "@/features/dashboard/hooks/useDashboardLayout";
import { WIDGET_REGISTRY } from "@/features/dashboard/config/widget-registry";
import { DashboardToolbar } from "@/features/dashboard/components/DashboardToolbar";
import { WasteRiskWidget } from "@/features/dashboard/components/widgets/WasteRiskWidget";
import { PredictedSurplusWidget } from "@/features/dashboard/components/widgets/PredictedSurplusWidget";
import { RecommendationsWidget } from "@/features/dashboard/components/widgets/RecommendationsWidget";
import { InventoryHealthWidget } from "@/features/dashboard/components/widgets/InventoryHealthWidget";
import { ImpactSnapshotWidget } from "@/features/dashboard/components/widgets/ImpactSnapshotWidget";
import { DonationOpportunitiesWidget } from "@/features/dashboard/components/widgets/DonationOpportunitiesWidget";
import { RecentActivityWidget } from "@/features/dashboard/components/widgets/RecentActivityWidget";
import type { WidgetId } from "@/types/dashboard";

import "react-grid-layout/css/styles.css";

const ResponsiveGridLayout = dynamic(
  () =>
    import("react-grid-layout/legacy").then((mod) => {
      const Grid = mod.WidthProvider(mod.Responsive);
      return Grid;
    }),
  { ssr: false },
);

const WIDGET_COMPONENTS: Record<
  WidgetId,
  React.ComponentType<{ orgId: string }>
> = {
  "waste-risk": WasteRiskWidget,
  "predicted-surplus": PredictedSurplusWidget,
  recommendations: RecommendationsWidget,
  "inventory-health": InventoryHealthWidget,
  "impact-snapshot": ImpactSnapshotWidget,
  "donation-opportunities": DonationOpportunitiesWidget,
  "recent-activity": RecentActivityWidget,
};

interface DashboardGridProps {
  orgId: string;
}

export function DashboardGrid({ orgId }: DashboardGridProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { layoutState, visibleLayouts, onLayoutChange, toggleWidget, resetLayout } =
    useDashboardLayout(orgId);

  const layouts = useMemo((): ResponsiveLayouts => {
    const mobileLayout: LayoutItem[] = visibleLayouts.map((item, index) => ({
      ...item,
      x: 0,
      y: index * item.h,
      w: 12,
    }));

    return {
      lg: visibleLayouts,
      md: visibleLayouts,
      sm: mobileLayout,
    };
  }, [visibleLayouts]);

  const handleLayoutChange = useCallback(
    (_layout: Layout, allLayouts: ResponsiveLayouts) => {
      const target = isDesktop ? allLayouts.lg : allLayouts.sm;
      if (target) onLayoutChange(target);
    },
    [isDesktop, onLayoutChange],
  );

  if (!layoutState) return null;

  const visibility = layoutState.visibility;

  if (!isDesktop) {
    return (
      <div className="space-y-4">
        <DashboardToolbar
          visibility={visibility}
          onToggleWidget={toggleWidget}
          onResetLayout={resetLayout}
        />
        <div className="grid gap-4">
          {WIDGET_REGISTRY.filter((w) => visibility[w.id]).map((widget) => {
            const Component = WIDGET_COMPONENTS[widget.id];
            return (
              <div key={widget.id} className="min-h-[200px]">
                <Component orgId={orgId} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DashboardToolbar
        visibility={visibility}
        onToggleWidget={toggleWidget}
        onResetLayout={resetLayout}
      />
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 0 }}
        cols={{ lg: 12, md: 12, sm: 12 }}
        rowHeight={80}
        draggableHandle=".widget-drag-handle"
        onLayoutChange={handleLayoutChange}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        compactType="vertical"
        isResizable
        isDraggable
        useCSSTransforms
      >
        {visibleLayouts.map((item) => {
          const Component = WIDGET_COMPONENTS[item.i as WidgetId];
          return (
            <div key={item.i} className="overflow-hidden">
              <Component orgId={orgId} />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
