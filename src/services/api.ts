/**
 * Camada de dados. Hoje é um mock em memória com latência simulada;
 * a assinatura (funções async que retornam o domínio) é a mesma que uma
 * API HTTP teria, então trocar por `fetch` não exige mudar nenhuma tela.
 */
import { bars } from '@/data/bars';
import { events, products, promos } from '@/data/catalog';
import { computeTotals } from '@/features/checkout/pricing';
import type { CartLine } from '@/store/cart';
import { usePreferences } from '@/store/preferences';
import type { Bar, BarEvent, Order, PaymentMethodId, Product, Promo } from '@/types/domain';

export class NetworkError extends Error {
  constructor() {
    super('Sem conexão com a internet');
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} não encontrado`);
    this.name = 'NotFoundError';
  }
}

const LATENCY_MS = 650;

async function request<T>(resolver: () => T, latency = LATENCY_MS): Promise<T> {
  await new Promise((r) => setTimeout(r, latency));
  if (usePreferences.getState().simulateOffline) throw new NetworkError();
  return resolver();
}

export interface HomeFeed {
  highlights: Bar[];
  promos: Promo[];
  events: (BarEvent & { barName: string; distanceKm: number })[];
  bars: Bar[];
}

const byId = (id: string) => bars.find((b) => b.id === id);

export const api = {
  getHomeFeed: () =>
    request<HomeFeed>(() => ({
      highlights: bars.filter((b) => b.featured),
      promos,
      events: [...events]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e) => ({ ...e, barName: byId(e.barId)?.name ?? '', distanceKm: byId(e.barId)?.distanceKm ?? 0 })),
      bars,
    })),

  getBar: (id: string) =>
    request(() => {
      const bar = byId(id);
      if (!bar) throw new NotFoundError('Bar');
      return {
        bar,
        events: events.filter((e) => e.barId === id),
        promos: promos.filter((p) => p.barId === id),
        popular: products.filter((p) => p.barId === id && (p.popular || p.promo)),
      };
    }),

  getMenu: (barId: string) => request<Product[]>(() => products.filter((p) => p.barId === barId), 450),

  getProduct: (id: string) =>
    request(() => {
      const product = products.find((p) => p.id === id);
      if (!product) throw new NotFoundError('Produto');
      return { product, bar: byId(product.barId)! };
    }, 250),

  createOrder: (input: { barId: string; lines: CartLine[]; method: PaymentMethodId; coupon?: string }) =>
    request<Order>(() => {
      const bar = byId(input.barId);
      if (!bar) throw new NotFoundError('Bar');
      const totals = computeTotals(input.lines, input.coupon);
      const id = `${Date.now()}`;
      return {
        id,
        code: `B${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 90) + 10)}`,
        barId: bar.id,
        barName: bar.name,
        items: input.lines.map((l) => ({
          productId: l.productId,
          name: l.name,
          category: l.category,
          qty: l.qty,
          unitPrice: l.unitPrice,
          optionLabel: l.optionLabel,
        })),
        ...totals,
        method: input.method,
        status: 'paid',
        createdAt: Date.now(),
      };
    }, 1200),

  /** Síncrono: dados já em memória, usados por mapa/assistente/perfil. */
  allBars: () => bars,
  allPromos: () => promos,
};
