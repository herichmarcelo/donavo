import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  pagarModalOpen: boolean;
  contaSelecionadaParaPagar: any | null;
  openPagarModal: (conta: any) => void;
  closePagarModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  pagarModalOpen: false,
  contaSelecionadaParaPagar: null,
  openPagarModal: (conta) => set({ pagarModalOpen: true, contaSelecionadaParaPagar: conta }),
  closePagarModal: () => set({ pagarModalOpen: false, contaSelecionadaParaPagar: null }),
}));
