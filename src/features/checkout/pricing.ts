/**
 * Regras de preço do pedido — funções puras, sem React, 100% testáveis.
 */

export interface PricedLine {
  qty: number;
  unitPrice: number;
}

export interface Totals {
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
  cashback: number;
}

export const SERVICE_FEE_RATE = 0.1;
export const CASHBACK_RATE = 0.05;

export const COUPONS: Record<string, number> = {
  BUDD10: 0.1,
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(lines: PricedLine[], coupon?: string): Totals {
  const subtotal = round2(lines.reduce((acc, l) => acc + l.qty * l.unitPrice, 0));
  const rate = coupon ? (COUPONS[coupon.toUpperCase()] ?? 0) : 0;
  const discount = round2(subtotal * rate);
  const serviceFee = round2((subtotal - discount) * SERVICE_FEE_RATE);
  const total = round2(subtotal - discount + serviceFee);
  const cashback = round2(total * CASHBACK_RATE);
  return { subtotal, discount, serviceFee, total, cashback };
}
