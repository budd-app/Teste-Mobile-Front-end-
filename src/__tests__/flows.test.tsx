import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProfileScreen from '@/app/(tabs)/profile';
import AssistantScreen from '@/app/assistant';
import BarScreen from '@/app/bar/[id]/index';
import CheckoutScreen from '@/app/checkout';
import { products } from '@/data/catalog';
import { useCart } from '@/store/cart';
import { useOrders } from '@/store/orders';
import { usePreferences } from '@/store/preferences';

declare global {
  var __routeParams: Record<string, string> | undefined;
}

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  useCart.getState().clear();
  usePreferences.getState().setSimulateOffline(false);
  globalThis.__routeParams = undefined;
});
afterEach(() => jest.useRealTimers());

describe('budd AI', () => {
  it('responde ao pedido com sugestões de bares', async () => {
    await render(<AssistantScreen />, { wrapper });
    await fireEvent.changeText(screen.getByLabelText('Mensagem para o budd AI'), 'bar tranquilo com drink autoral');
    await fireEvent.press(screen.getByLabelText('Enviar mensagem'));

    expect(screen.getByLabelText('budd AI está digitando')).toBeTruthy();
    expect(await screen.findByText(/combinam com você/)).toBeTruthy();
    expect(screen.getAllByLabelText(/de compatibilidade/).length).toBeGreaterThan(0);
  });
});

describe('Perfil do bar', () => {
  it('carrega o bar e mostra as informações principais', async () => {
    globalThis.__routeParams = { id: 'quintal-aurora' };
    await render(<BarScreen />, { wrapper });

    expect(await screen.findByRole('header', { name: 'Quintal Aurora' })).toBeTruthy();
    expect(screen.getByText('Galeria')).toBeTruthy();
    expect(screen.getByText('Mais pedidos')).toBeTruthy();
    expect(screen.getByText('Bom saber')).toBeTruthy();
  });

  it('mostra erro com saída quando o bar não existe', async () => {
    globalThis.__routeParams = { id: 'nao-existe' };
    await render(<BarScreen />, { wrapper });
    expect(await screen.findByText('Bar não encontrado')).toBeTruthy();
  });

  it('mostra erro de rede quando offline', async () => {
    usePreferences.getState().setSimulateOffline(true);
    globalThis.__routeParams = { id: 'quintal-aurora' };
    await render(<BarScreen />, { wrapper });
    expect(await screen.findByText('Caiu o sinal')).toBeTruthy();
  });
});

describe('Pagamento', () => {
  it('carrinho vazio mostra estado vazio', async () => {
    await render(<CheckoutScreen />, { wrapper });
    expect(screen.getByText('Copo vazio')).toBeTruthy();
  });

  it('aplica cupom e conclui o pedido', async () => {
    useCart.getState().add(products.find((p) => p.id === 'qa-negroni')!);
    useCart.getState().add(products.find((p) => p.id === 'qa-croqueta')!);
    await render(<CheckoutScreen />, { wrapper });

    await fireEvent.changeText(screen.getByLabelText('Código do cupom'), 'budd10');
    await fireEvent.press(screen.getByLabelText('Aplicar cupom'));
    expect(screen.getByText('R$ 71,28')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Pagar R$ 71,28 com Pix'));
    await jest.advanceTimersByTimeAsync(1500);

    expect(router.replace).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/order/[id]' }));
    expect(useCart.getState().lines).toHaveLength(0);
    expect(useOrders.getState().orders[0].total).toBe(71.28);
  });
});

describe('Perfil do usuário', () => {
  it('ajustar preferências atualiza as recomendações', async () => {
    await render(<ProfileScreen />, { wrapper });
    expect(screen.getByText('Seu estilo de rolê')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Samba' }));
    expect(usePreferences.getState().vibes).toContain('samba');
  });
});
