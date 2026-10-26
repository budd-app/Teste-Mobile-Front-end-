import { create } from 'zustand';

import type { Order, OrderStatus } from '@/types/domain';

import { toast } from './toast';

interface OrdersState {
  orders: Order[];
  add: (order: Order) => void;
  setStatus: (id: string, status: OrderStatus) => void;
}

/** Tempo simulado de cada etapa — no app real isso viria por push/websocket. */
export const ORDER_TIMELINE_MS = { preparing: 3000, ready: 9000 };

export const useOrders = create<OrdersState>((set, get) => ({
  orders: [],
  add: (order) => {
    set({ orders: [order, ...get().orders] });
    setTimeout(() => get().setStatus(order.id, 'preparing'), ORDER_TIMELINE_MS.preparing);
    setTimeout(() => {
      get().setStatus(order.id, 'ready');
      toast(`Pedido ${order.code} pronto no balcão!`);
    }, ORDER_TIMELINE_MS.ready);
  },
  setStatus: (id, status) => set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)) }),
}));
