import { create } from 'zustand';

interface FavoritesState {
  ids: string[];
  toggle: (barId: string) => boolean;
}

export const useFavorites = create<FavoritesState>((set, get) => ({
  ids: ['quintal-aurora', 'casa-verde', 'boteco-lume'],
  toggle: (barId) => {
    const has = get().ids.includes(barId);
    set({ ids: has ? get().ids.filter((id) => id !== barId) : [...get().ids, barId] });
    return !has;
  },
}));

export const selectIsFavorite = (barId: string) => (s: FavoritesState) => s.ids.includes(barId);
