import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_PREDICTIONS_FILTERS,
  type PredictionsFiltersInput,
} from "@/features/predictions/schemas/predictions-filters.schema";
import {
  DEFAULT_RECOMMENDATION_FILTERS,
  type RecommendationFiltersInput,
} from "@/features/predictions/schemas/recommendation-filters.schema";
import { DEFAULT_SIMULATION_INPUT } from "@/features/predictions/schemas/simulation-input.schema";
import type { SimulationInputForm } from "@/features/predictions/schemas/simulation-input.schema";
import type { PredictionsTabId } from "@/types/predictions";

interface OrgPredictionsState {
  filters: PredictionsFiltersInput;
  recommendationFilters: RecommendationFiltersInput;
  activeTab: PredictionsTabId;
  selectedForecastId: string | null;
  simulatorDraft: SimulationInputForm;
  savedScenarioIds: string[];
  compareScenarioIds: string[];
}

function createDefaultOrgState(): OrgPredictionsState {
  return {
    filters: { ...DEFAULT_PREDICTIONS_FILTERS },
    recommendationFilters: { ...DEFAULT_RECOMMENDATION_FILTERS },
    activeTab: "summary",
    selectedForecastId: null,
    simulatorDraft: { ...DEFAULT_SIMULATION_INPUT },
    savedScenarioIds: [],
    compareScenarioIds: [],
  };
}

interface PredictionsStoreState {
  orgStates: Record<string, OrgPredictionsState>;
  getStateForOrg: (orgId: string) => OrgPredictionsState;
  setFilters: (orgId: string, filters: Partial<PredictionsFiltersInput>) => void;
  setRecommendationFilters: (
    orgId: string,
    filters: Partial<RecommendationFiltersInput>,
  ) => void;
  setActiveTab: (orgId: string, tab: PredictionsTabId) => void;
  setSelectedForecastId: (orgId: string, id: string | null) => void;
  setSimulatorDraft: (
    orgId: string,
    draft: Partial<SimulationInputForm>,
  ) => void;
  addSavedScenarioId: (orgId: string, id: string) => void;
  setCompareScenarioIds: (orgId: string, ids: string[]) => void;
  resetFilters: (orgId: string) => void;
}

export const usePredictionsStore = create<PredictionsStoreState>()(
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
          recommendationFilters: {
            ...defaults.recommendationFilters,
            ...stored.recommendationFilters,
          },
          simulatorDraft: {
            ...defaults.simulatorDraft,
            ...stored.simulatorDraft,
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

      setRecommendationFilters: (orgId, filters) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: {
                ...current,
                recommendationFilters: {
                  ...current.recommendationFilters,
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

      setSelectedForecastId: (orgId, id) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: { ...current, selectedForecastId: id },
            },
          };
        });
      },

      setSimulatorDraft: (orgId, draft) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: {
                ...current,
                simulatorDraft: { ...current.simulatorDraft, ...draft },
              },
            },
          };
        });
      },

      addSavedScenarioId: (orgId, id) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          const ids = current.savedScenarioIds.includes(id)
            ? current.savedScenarioIds
            : [...current.savedScenarioIds, id];
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: { ...current, savedScenarioIds: ids },
            },
          };
        });
      },

      setCompareScenarioIds: (orgId, ids) => {
        set((state) => {
          const current = state.orgStates[orgId] ?? createDefaultOrgState();
          return {
            orgStates: {
              ...state.orgStates,
              [orgId]: { ...current, compareScenarioIds: ids },
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
    { name: "harvest-predictions" },
  ),
);
