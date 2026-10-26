import { create } from 'zustand';

import type { Vibe } from '@/types/domain';

interface PreferencesState {
  vibes: Vibe[];
  toggleVibe: (v: Vibe) => void;
  /** Simula falha de rede para demonstrar os estados de erro. */
  simulateOffline: boolean;
  setSimulateOffline: (v: boolean) => void;
}

export const usePreferences = create<PreferencesState>((set, get) => ({
  vibes: ['jazz', 'cocktail', 'outdoor', 'wine'],
  toggleVibe: (v) => {
    const has = get().vibes.includes(v);
    set({ vibes: has ? get().vibes.filter((x) => x !== v) : [...get().vibes, v] });
  },
  simulateOffline: false,
  setSimulateOffline: (simulateOffline) => set({ simulateOffline }),
}));
