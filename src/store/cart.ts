import { create } from 'zustand';

import type { CategoryId, Product, ProductOption } from '@/types/domain';

export interface CartLine {
  key: string;
  productId: string;
  name: string;
  category: CategoryId;
  qty: number;
  unitPrice: number;
  optionId?: string;
  optionLabel?: string;
}

interface CartState {
  barId: string | null;
  lines: CartLine[];
  /**
   * Adiciona ao carrinho. Um pedido é sempre de UM bar: adicionar item de
   * outro bar substitui o carrinho, e o retorno avisa a UI para informar.
   */
  add: (product: Product, qty?: number, option?: ProductOption) => { replaced: boolean };
  setQty: (key: string, qty: number) => void;
  clear: () => void;
}

export const lineKey = (productId: string, optionId?: string) => (optionId ? `${productId}:${optionId}` : productId);

export const useCart = create<CartState>((set, get) => ({
  barId: null,
  lines: [],
  add: (product, qty = 1, option) => {
    const { barId, lines } = get();
    const replaced = barId !== null && barId !== product.barId && lines.length > 0;
    const base = replaced ? [] : lines;
    const key = lineKey(product.id, option?.id);
    const existing = base.find((l) => l.key === key);
    const next = existing
      ? base.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
      : [
          ...base,
          {
            key,
            productId: product.id,
            name: product.name,
            category: product.category,
            qty,
            unitPrice: product.price + (option?.extra ?? 0),
            optionId: option?.id,
            optionLabel: option && option.extra > 0 ? option.label : undefined,
          },
        ];
    set({ barId: product.barId, lines: next });
    return { replaced };
  },
  setQty: (key, qty) => {
    const lines =
      qty <= 0 ? get().lines.filter((l) => l.key !== key) : get().lines.map((l) => (l.key === key ? { ...l, qty } : l));
    set({ lines, barId: lines.length ? get().barId : null });
  },
  clear: () => set({ lines: [], barId: null }),
}));

/** Seletores derivados — use-os com `useCart(selectX)` para re-render mínimo. */
export const selectCount = (s: CartState) => s.lines.reduce((acc, l) => acc + l.qty, 0);
export const selectSubtotal = (s: CartState) => s.lines.reduce((acc, l) => acc + l.qty * l.unitPrice, 0);
export const selectQtyForProduct = (productId: string) => (s: CartState) =>
  s.lines.filter((l) => l.productId === productId).reduce((acc, l) => acc + l.qty, 0);
