import { create } from 'zustand';

import { DEFAULT_FILTERS, type Filters, type QuickFilter } from '@/features/discovery/filtering';

interface FiltersState extends Filters {
  setQuick: (q: QuickFilter) => void;
  /** Aplica o rascunho do bottom sheet de uma vez (evita refiltrar a cada toque). */
  apply: (next: Omit<Filters, 'quick'>) => void;
  reset: () => void;
}

export const useFilters = create<FiltersState>((set) => ({
  ...DEFAULT_FILTERS,
  setQuick: (quick) => set({ quick }),
  apply: (next) => set(next),
  reset: () => set({ ...DEFAULT_FILTERS }),
}));
