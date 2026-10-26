import type { OpeningHours, PriceLevel } from '@/types/domain';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 38 → "R$ 38,00" (com espaço normal, não o NBSP do Intl, para facilitar testes e leitores de tela). */
export function formatBRL(value: number): string {
  return brl.format(value).replace(/\u00a0/g, ' ');
}

/** 38 → "R$ 38" ; 38.5 → "R$ 38,50". Para cards, onde espaço é escasso. */
export function formatBRLShort(value: number): string {
  return Number.isInteger(value) ? `R$ ${value}` : formatBRL(value);
}

export function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

export function formatPriceLevel(level: PriceLevel): string {
  return '$'.repeat(level);
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',').replace(',0', '')} mil`;
  return String(n);
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Suporta horários que atravessam a meia-noite (ex.: 17:00–02:00). */
export function isOpenAt(hours: OpeningHours, date: Date): boolean {
  const now = date.getHours() * 60 + date.getMinutes();
  const opens = toMinutes(hours.opens);
  const closes = toMinutes(hours.closes);
  if (opens === closes) return true;
  if (opens < closes) return now >= opens && now < closes;
  return now >= opens || now < closes;
}

export function openingLabel(hours: OpeningHours, date: Date): { open: boolean; label: string } {
  const open = isOpenAt(hours, date);
  const closes = hours.closes.replace(':00', 'h').replace(':', 'h');
  const opens = hours.opens.replace(':00', 'h').replace(':', 'h');
  return open ? { open, label: `Aberto até ${closes}` } : { open, label: `Abre às ${opens}` };
}

const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

/** "2026-10-24" → { dow: "SÁB", day: "24" } sem sofrer com fuso (parse manual). */
export function eventDateParts(iso: string): { dow: string; day: string } {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return { dow: weekdays[date.getDay()], day: String(d).padStart(2, '0') };
}

export function greeting(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}
