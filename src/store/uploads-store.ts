import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_UPLOAD_FILTERS,
  type UploadFiltersInput,
} from "@/features/uploads/schemas/upload-filters.schema";
import type { UploadTabId } from "@/types/upload";

interface OrgUploadState {
  filters: UploadFiltersInput;
  activeTab: UploadTabId;
  selectedUploadId: string | null;
}

function createDefaultOrgState(): OrgUploadState {
  return {
    filters: { ...DEFAULT_UPLOAD_FILTERS },
    activeTab: "upload",
    selectedUploadId: null,
  };
}

interface UploadsStoreState {
  orgStates: Record<string, OrgUploadState>;
  getStateForOrg: (orgId: string) => OrgUploadState;
  setFilters: (orgId: string, filters: Partial<UploadFiltersInput>) => void;
  setActiveTab: (orgId: string, tab: UploadTabId) => void;
  setSelectedUploadId: (orgId: string, id: string | null) => void;
  resetFilters: (orgId: string) => void;
}

export const useUploadsStore = create<UploadsStoreState>()(
  persist(
    (set, get) => ({
      orgStates: {},

      getStateForOrg: (orgId) => {
        const existing = get().orgStates[orgId];
        if (existing) return existing;
        const defaultState = createDefaultOrgState();
        set((state) => ({
          orgStates: { ...state.orgStates, [orgId]: defaultState },
        }));
        return defaultState;
      },

      setFilters: (orgId, partial) => {
        const current = get().getStateForOrg(orgId);
        set((state) => ({
          orgStates: {
            ...state.orgStates,
            [orgId]: {
              ...current,
              filters: { ...current.filters, ...partial },
            },
          },
        }));
      },

      setActiveTab: (orgId, tab) => {
        const current = get().getStateForOrg(orgId);
        set((state) => ({
          orgStates: {
            ...state.orgStates,
            [orgId]: { ...current, activeTab: tab },
          },
        }));
      },

      setSelectedUploadId: (orgId, id) => {
        const current = get().getStateForOrg(orgId);
        set((state) => ({
          orgStates: {
            ...state.orgStates,
            [orgId]: { ...current, selectedUploadId: id },
          },
        }));
      },

      resetFilters: (orgId) => {
        const current = get().getStateForOrg(orgId);
        set((state) => ({
          orgStates: {
            ...state.orgStates,
            [orgId]: {
              ...current,
              filters: { ...DEFAULT_UPLOAD_FILTERS },
            },
          },
        }));
      },
    }),
    { name: "harvest-uploads-store" },
  ),
);
