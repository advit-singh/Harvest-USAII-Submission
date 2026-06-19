import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_ANALYTICS_FILTERS,
  type AnalyticsFiltersInput,
} from "@/features/analytics/schemas/analytics-filters.schema";
import type { AnalyticsTabId } from "@/types/analytics";

interface OrgAnalyticsState {
  filters: AnalyticsFiltersInput;
  activeTab: AnalyticsTabId;
}

function createDefaultOrgState(): OrgAnalyticsState {
  return {
    filters: { ...DEFAULT_ANALYTICS_FILTERS },
    activeTab: "waste",
  };
}

interface AnalyticsStoreState {
  orgStates: Record<string, OrgAnalyticsState>;
  getStateForOrg: (orgId: string) => OrgAnalyticsState;
  setFilters: (orgId: string, filters: Partial<AnalyticsFiltersInput>) => void;
  setActiveTab: (orgId: string, tab: AnalyticsTabId) => void;
  resetFilters: (orgId: string) => void;
}

export const useAnalyticsStore = create<AnalyticsStoreState>()(
  persist(
    (set, get) => ({
      orgStates: {},

      getStateForOrg: (orgId) => {
        const stored = get().orgStates[orgId];
        const defaults = createDefaultOrgState();
        if (!stored) return defaults;
        return {
          ...defaults,
          ...stored,
          filters: { ...defaults.filters, ...stored.filters },
        };
      },

      setFilters: (orgId, filters) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: {
                ...current,
                filters: { ...current.filters, ...filters },
              },
            },
          };
        });
      },

      setActiveTab: (orgId, tab) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: { ...current, activeTab: tab },
            },
          };
        });
      },

      resetFilters: (orgId) => {
        set((state) => ({
          orgStates: {
            ...state.orgStates,
            [orgId]: createDefaultOrgState(),
          },
        }));
      },
    }),
    { name: "harvest-analytics" },
  ),
);
