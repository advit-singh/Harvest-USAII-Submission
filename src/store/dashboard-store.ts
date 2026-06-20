import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardLayoutState, GridLayoutItem, WidgetId } from "@/types/dashboard";

export const DEFAULT_LAYOUTS: GridLayoutItem[] = [
  { i: "waste-risk", x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
  { i: "predicted-surplus", x: 4, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
  { i: "impact-snapshot", x: 8, y: 0, w: 4, h: 2, minW: 3, minH: 2 },
  { i: "recommendations", x: 0, y: 2, w: 8, h: 3, minW: 4, minH: 2 },
  { i: "inventory-health", x: 8, y: 2, w: 4, h: 2, minW: 3, minH: 2 },
  { i: "donation-opportunities", x: 0, y: 5, w: 6, h: 2, minW: 3, minH: 2 },
  { i: "recent-activity", x: 6, y: 5, w: 6, h: 3, minW: 3, minH: 2 },
];

export const DEFAULT_VISIBILITY: Record<WidgetId, boolean> = {
  "waste-risk": true,
  "predicted-surplus": true,
  recommendations: true,
  "inventory-health": true,
  "impact-snapshot": true,
  "donation-opportunities": true,
  "recent-activity": true,
};

function createDefaultLayoutState(): DashboardLayoutState {
  return {
    layouts: DEFAULT_LAYOUTS,
    visibility: { ...DEFAULT_VISIBILITY },
    updatedAt: new Date().toISOString(),
  };
}

interface DashboardStoreState {
  orgLayouts: Record<string, DashboardLayoutState>;
  getLayoutForOrg: (orgId: string) => DashboardLayoutState;
  setLayouts: (orgId: string, layouts: GridLayoutItem[]) => void;
  setWidgetVisibility: (orgId: string, widgetId: WidgetId, visible: boolean) => void;
  resetLayout: (orgId: string) => void;
}

export const useDashboardStore = create<DashboardStoreState>()(
  persist(
    (set, get) => ({
      orgLayouts: {},

      getLayoutForOrg: (orgId) => {
        return get().orgLayouts[orgId] ?? createDefaultLayoutState();
      },

      setLayouts: (orgId, layouts) => {
        set((state) => {
          const current = state.orgLayouts[orgId] ?? createDefaultLayoutState();
          return {
            orgLayouts: {
              ...state.orgLayouts,
              [orgId]: {
                ...current,
                layouts,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      setWidgetVisibility: (orgId, widgetId, visible) => {
        set((state) => {
          const current = state.orgLayouts[orgId] ?? createDefaultLayoutState();
          return {
            orgLayouts: {
              ...state.orgLayouts,
              [orgId]: {
                ...current,
                visibility: { ...current.visibility, [widgetId]: visible },
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      resetLayout: (orgId) => {
        set((state) => ({
          orgLayouts: {
            ...state.orgLayouts,
            [orgId]: createDefaultLayoutState(),
          },
        }));
      },
    }),
    { name: "harvest-dashboard" },
  ),
);
