import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_DONATION_HISTORY_FILTERS,
  DEFAULT_RECIPIENT_FILTERS,
  DEFAULT_RESCUE_FILTERS,
  type DonationHistoryFiltersInput,
  type RecipientFiltersInput,
  type RescueFiltersInput,
} from "@/features/rescue/schemas/rescue-filters.schema";
import type { RescueTabId } from "@/types/rescue";

interface OrgRescueState {
  filters: RescueFiltersInput;
  recipientFilters: RecipientFiltersInput;
  historyFilters: DonationHistoryFiltersInput;
  activeTab: RescueTabId;
  selectedOpportunityId: string | null;
  selectedRecipientId: string | null;
  impactTimeRange: "week" | "month" | "quarter" | "year";
}

function createDefaultOrgState(): OrgRescueState {
  return {
    filters: { ...DEFAULT_RESCUE_FILTERS },
    recipientFilters: { ...DEFAULT_RECIPIENT_FILTERS },
    historyFilters: { ...DEFAULT_DONATION_HISTORY_FILTERS },
    activeTab: "opportunities",
    selectedOpportunityId: null,
    selectedRecipientId: null,
    impactTimeRange: "week",
  };
}

interface RescueStoreState {
  orgStates: Record<string, OrgRescueState>;
  getStateForOrg: (orgId: string) => OrgRescueState;
  setFilters: (orgId: string, filters: Partial<RescueFiltersInput>) => void;
  setRecipientFilters: (
    orgId: string,
    filters: Partial<RecipientFiltersInput>,
  ) => void;
  setHistoryFilters: (
    orgId: string,
    filters: Partial<DonationHistoryFiltersInput>,
  ) => void;
  setActiveTab: (orgId: string, tab: RescueTabId) => void;
  setSelectedOpportunityId: (orgId: string, id: string | null) => void;
  setSelectedRecipientId: (orgId: string, id: string | null) => void;
  setImpactTimeRange: (
    orgId: string,
    range: OrgRescueState["impactTimeRange"],
  ) => void;
  resetFilters: (orgId: string) => void;
}

export const useRescueStore = create<RescueStoreState>()(
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
          recipientFilters: {
            ...defaults.recipientFilters,
            ...stored.recipientFilters,
          },
          historyFilters: {
            ...defaults.historyFilters,
            ...stored.historyFilters,
          },
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

      setRecipientFilters: (orgId, filters) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: {
                ...current,
                recipientFilters: {
                  ...current.recipientFilters,
                  ...filters,
                },
              },
            },
          };
        });
      },

      setHistoryFilters: (orgId, filters) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: {
                ...current,
                historyFilters: {
                  ...current.historyFilters,
                  ...filters,
                },
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

      setSelectedOpportunityId: (orgId, id) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: { ...current, selectedOpportunityId: id },
            },
          };
        });
      },

      setSelectedRecipientId: (orgId, id) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: { ...current, selectedRecipientId: id },
            },
          };
        });
      },

      setImpactTimeRange: (orgId, range) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: { ...current, impactTimeRange: range },
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
    { name: "harvest-rescue" },
  ),
);
