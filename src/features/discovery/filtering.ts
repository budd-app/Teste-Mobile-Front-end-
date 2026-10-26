import type { Bar, PriceLevel, Vibe } from '@/types/domain';
import { isOpenAt } from '@/utils/format';

export type QuickFilter = 'foryou' | 'open' | 'happy' | 'live' | 'rooftop';

export interface Filters {
  quick: QuickFilter;
  vibes: Vibe[];
  maxDistanceKm: number;
  priceLevels: PriceLevel[];
  openNow: boolean;
  appOrders: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  quick: 'foryou',
  vibes: [],
  maxDistanceKm: 5,
  priceLevels: [],
  openNow: false,
  appOrders: false,
};

export const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: 'foryou', label: 'Para você' },
  { id: 'open', label: 'Aberto agora' },
  { id: 'happy', label: 'Happy hour' },
  { id: 'live', label: 'Música ao vivo' },
  { id: 'rooftop', label: 'Rooftop' },
];

export const VIBE_OPTIONS: { id: Vibe; label: string }[] = [
  { id: 'bar', label: 'Bar' },
  { id: 'boteco', label: 'Boteco' },
  { id: 'cocktail', label: 'Coquetelaria' },
  { id: 'live', label: 'Música ao vivo' },
  { id: 'rooftop', label: 'Rooftop' },
  { id: 'balada', label: 'Balada' },
  { id: 'pet', label: 'Pet friendly' },
];

/** Quantos filtros avançados (do bottom sheet) estão ativos — vira badge no botão. */
export function countAdvanced(f: Filters): number {
  return (
    (f.vibes.length ? 1 : 0) +
    (f.maxDistanceKm !== DEFAULT_FILTERS.maxDistanceKm ? 1 : 0) +
    (f.priceLevels.length ? 1 : 0) +
    (f.openNow ? 1 : 0) +
    (f.appOrders ? 1 : 0)
  );
}

/** Happy hour: bares com promoção ativa. Recebe o conjunto para manter a função pura. */
export function applyFilters(list: Bar[], f: Filters, now: Date, ctx: { barsWithPromo: Set<string>; preferred: Vibe[] }): Bar[] {
  const result = list.filter((b) => {
    if (b.distanceKm > f.maxDistanceKm) return false;
    if (f.priceLevels.length && !f.priceLevels.includes(b.priceLevel)) return false;
    if (f.vibes.length && !f.vibes.some((v) => b.vibes.includes(v))) return false;
    if ((f.openNow || f.quick === 'open') && !isOpenAt(b.hours, now)) return false;
    if (f.appOrders && !b.acceptsAppOrders) return false;
    if (f.quick === 'happy' && !ctx.barsWithPromo.has(b.id)) return false;
    if (f.quick === 'live' && !b.vibes.includes('live')) return false;
    if (f.quick === 'rooftop' && !b.vibes.includes('rooftop')) return false;
    return true;
  });

  if (f.quick === 'foryou') {
    const affinity = (b: Bar) => b.vibes.filter((v) => ctx.preferred.includes(v)).length;
    return [...result].sort((a, b) => affinity(b) - affinity(a) || b.rating - a.rating);
  }
  return [...result].sort((a, b) => a.distanceKm - b.distanceKm);
}

export function searchBars(list: Bar[], query: string): Bar[] {
  const q = normalize(query.trim());
  if (!q) return list;
  return list.filter((b) => normalize(`${b.name} ${b.category} ${b.neighborhood} ${b.tagline}`).includes(q));
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
