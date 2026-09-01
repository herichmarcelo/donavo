import { create } from "zustand";

export interface ContasFiltros {
  status?: string; // "TODOS" | "PENDENTE" | "PAGA" | "VENCIDA" | "CANCELADA"
  categoria?: string; // "TODAS" | "CUSTEIO" | "INVESTIMENTO" | "OUTRAS"
  mes?: number; // 1 - 12
  ano?: number; // ex: 2026
  busca?: string; // Fornecedor ou discriminação
}

interface ContasState {
  filtros: ContasFiltros;
  setFiltros: (novosFiltros: Partial<ContasFiltros>) => void;
  resetFiltros: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const defaultFiltros: ContasFiltros = {
  status: "TODOS",
  categoria: "TODAS",
  mes: new Date().getMonth() + 1,
  ano: new Date().getFullYear(),
  busca: "",
};

export const useContasStore = create<ContasState>((set) => ({
  filtros: defaultFiltros,
  setFiltros: (novos) =>
    set((state) => ({
      filtros: { ...state.filtros, ...novos },
    })),
  resetFiltros: () => set({ filtros: defaultFiltros }),
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
