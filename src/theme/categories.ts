import type { IconName } from '@/components/icons/Icon';
import type { CategoryId } from '@/types/domain';

import { palette } from './tokens';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  icon: IconName;
  color: string;
  /** Fundo translúcido (~14%) usado atrás do ícone. */
  tint: string;
}

/** Identidade visual de cada categoria de produto: ícone + cor consistentes. */
export const categories: Record<CategoryId, CategoryMeta> = {
  cocktail: { id: 'cocktail', label: 'Drinks', icon: 'cocktail', color: palette.pink, tint: 'rgba(255,122,198,0.14)' },
  drink: { id: 'drink', label: 'Bebidas', icon: 'beer', color: palette.amber, tint: 'rgba(255,181,71,0.14)' },
  food: { id: 'food', label: 'Comidas', icon: 'burger', color: palette.orange, tint: 'rgba(255,138,61,0.14)' },
  ticket: { id: 'ticket', label: 'Ingressos', icon: 'ticket', color: palette.lime500, tint: 'rgba(118,235,60,0.14)' },
  event: { id: 'event', label: 'Eventos', icon: 'music', color: palette.violet, tint: 'rgba(169,139,255,0.16)' },
  service: { id: 'service', label: 'Serviços', icon: 'service', color: palette.cyan, tint: 'rgba(95,212,224,0.14)' },
};

export const categoryOrder: CategoryId[] = ['cocktail', 'drink', 'food', 'ticket', 'event', 'service'];
