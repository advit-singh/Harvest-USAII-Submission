import { create } from "zustand";

interface SettingsStoreState {
  selectedRoleId: string | null;
  setSelectedRoleId: (roleId: string | null) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  selectedRoleId: null,
  setSelectedRoleId: (selectedRoleId) => set({ selectedRoleId }),
}));
