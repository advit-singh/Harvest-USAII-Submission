import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type TableDensity = "comfortable" | "compact";
export type ResolvedTheme = "light" | "dark";

interface UiState {
  sidebarCollapsed: boolean;
  theme: Theme;
  tableDensity: TableDensity;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: (resolvedTheme?: ResolvedTheme) => void;
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
      toggleTheme: (resolvedTheme) =>
        set((state) => {
          const isDark =
            resolvedTheme === "dark" ||
            (resolvedTheme !== "light" && state.theme === "dark");
          return { theme: isDark ? "light" : "dark" };
        }),
      setTableDensity: (tableDensity) => set({ tableDensity }),
    }),
    { name: "harvest-ui" },
  ),
);
