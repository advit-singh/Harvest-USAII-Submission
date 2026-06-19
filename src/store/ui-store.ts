import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type TableDensity = "comfortable" | "compact";

interface UiState {
  sidebarCollapsed: boolean;
  theme: Theme;
  tableDensity: TableDensity;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setTableDensity: (density: TableDensity) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: "system",
      tableDensity: "comfortable",
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      setTableDensity: (tableDensity) => set({ tableDensity }),
    }),
    { name: "harvest-ui" },
  ),
);
