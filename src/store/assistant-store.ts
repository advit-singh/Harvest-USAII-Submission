import { create } from "zustand";
import type { AssistantMobileView } from "@/types/assistant";

interface AssistantUiState {
  evidencePanelOpen: boolean;
  selectedCitationId: string | null;
  mobileView: AssistantMobileView;
  pendingConversationId: string | null;
  setEvidencePanelOpen: (open: boolean) => void;
  toggleEvidencePanel: () => void;
  setSelectedCitationId: (id: string | null) => void;
  setMobileView: (view: AssistantMobileView) => void;
  setPendingConversationId: (id: string | null) => void;
}

export const useAssistantStore = create<AssistantUiState>((set) => ({
  evidencePanelOpen: true,
  selectedCitationId: null,
  mobileView: "chat",
  pendingConversationId: null,
  setEvidencePanelOpen: (evidencePanelOpen) => set({ evidencePanelOpen }),
  toggleEvidencePanel: () =>
    set((state) => ({ evidencePanelOpen: !state.evidencePanelOpen })),
  setSelectedCitationId: (selectedCitationId) => set({ selectedCitationId }),
  setMobileView: (mobileView) => set({ mobileView }),
  setPendingConversationId: (pendingConversationId) =>
    set({ pendingConversationId }),
}));
