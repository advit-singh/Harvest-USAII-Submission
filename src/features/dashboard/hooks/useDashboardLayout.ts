"use client";

import { useCallback, useMemo } from "react";
import type { Layout, LayoutItem } from "react-grid-layout/legacy";
import { useDashboardStore } from "@/store/dashboard-store";
import type { GridLayoutItem, WidgetId } from "@/types/dashboard";

export function useDashboardLayout(orgId: string | null) {
  const getLayoutForOrg = useDashboardStore((s) => s.getLayoutForOrg);
  const setLayouts = useDashboardStore((s) => s.setLayouts);
  const setWidgetVisibility = useDashboardStore((s) => s.setWidgetVisibility);
  const resetLayout = useDashboardStore((s) => s.resetLayout);

  const layoutState = useMemo(
    () => (orgId ? getLayoutForOrg(orgId) : null),
    [orgId, getLayoutForOrg],
  );

  const visibleLayouts = useMemo((): LayoutItem[] => {
    if (!layoutState) return [];
    return layoutState.layouts.filter((item) => layoutState.visibility[item.i]);
  }, [layoutState]);

  const onLayoutChange = useCallback(
    (newLayout: Layout) => {
      if (!orgId) return;
      const mapped: GridLayoutItem[] = newLayout.map((item) => ({
        i: item.i as WidgetId,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
      }));
      setLayouts(orgId, mapped);
    },
    [orgId, setLayouts],
  );

  const toggleWidget = useCallback(
    (widgetId: WidgetId, visible: boolean) => {
      if (!orgId) return;
      setWidgetVisibility(orgId, widgetId, visible);
    },
    [orgId, setWidgetVisibility],
  );

  const handleReset = useCallback(() => {
    if (!orgId) return;
    resetLayout(orgId);
  }, [orgId, resetLayout]);

  return {
    layoutState,
    visibleLayouts,
    onLayoutChange,
    toggleWidget,
    resetLayout: handleReset,
  };
}
