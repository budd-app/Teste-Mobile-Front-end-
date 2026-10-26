import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  current: ToastMessage | null;
  show: (message: string, tone?: ToastTone) => void;
  hide: () => void;
}

let seq = 0;

export const useToast = create<ToastState>((set) => ({
  current: null,
  show: (message, tone = 'success') => set({ current: { id: ++seq, message, tone } }),
  hide: () => set({ current: null }),
}));

/** Atalho fora de componentes (ex.: callbacks de mutation). */
export const toast = (message: string, tone?: ToastTone) => useToast.getState().show(message, tone);
