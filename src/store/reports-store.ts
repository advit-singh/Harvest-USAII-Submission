import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_REPORT_FILTERS,
  type ReportFiltersInput,
} from "@/features/reports/schemas/report-filters.schema";
import type { ReportTabId, ReportTemplateId } from "@/types/report";

interface OrgReportState {
  filters: ReportFiltersInput;
  activeTab: ReportTabId;
  selectedReportId: string | null;
  builderOpen: boolean;
  builderTemplate: ReportTemplateId | null;
}

function createDefaultOrgState(): OrgReportState {
  return {
    filters: { ...DEFAULT_REPORT_FILTERS },
    activeTab: "templates",
    selectedReportId: null,
    builderOpen: false,
    builderTemplate: null,
  };
}

interface ReportsStoreState {
  orgStates: Record<string, OrgReportState>;
  getStateForOrg: (orgId: string) => OrgReportState;
  setFilters: (orgId: string, filters: Partial<ReportFiltersInput>) => void;
  setActiveTab: (orgId: string, tab: ReportTabId) => void;
  setSelectedReportId: (orgId: string, id: string | null) => void;
  setBuilderOpen: (
    orgId: string,
    open: boolean,
    template?: ReportTemplateId | null,
  ) => void;
  resetFilters: (orgId: string) => void;
}

export const useReportsStore = create<ReportsStoreState>()(
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

      setSelectedReportId: (orgId, id) => {
        const current = get().getStateForOrg(orgId);
        set((state) => ({
          orgStates: {
            ...state.orgStates,
            [orgId]: { ...current, selectedReportId: id },
          },
        }));
      },

      setBuilderOpen: (orgId, open, template = null) => {
        const current = get().getStateForOrg(orgId);
        set((state) => ({
          orgStates: {
            ...state.orgStates,
            [orgId]: {
              ...current,
              builderOpen: open,
              builderTemplate: open ? template : null,
            },
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
              filters: { ...DEFAULT_REPORT_FILTERS },
            },
          },
        }));
      },
    }),
    { name: "harvest-reports-store" },
  ),
);
