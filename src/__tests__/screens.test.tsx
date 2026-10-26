import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from '@/app/(tabs)/index';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/catalog';
import { selectCount, useCart } from '@/store/cart';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  useCart.getState().clear();
});
afterEach(() => jest.useRealTimers());

describe('Home', () => {
  it('mostra skeleton e depois o feed com seções e bares', async () => {
    await render(<HomeScreen />, { wrapper });
    expect(screen.getByLabelText('Carregando conteúdo')).toBeTruthy();

    expect(await screen.findByText('Destaques')).toBeTruthy();
    expect(screen.getByText('Promoções agora')).toBeTruthy();
    expect(screen.getByText('Eventos perto de você')).toBeTruthy();
    expect(screen.getByText('Bares para você')).toBeTruthy();
  });

  it('busca filtra o feed e mostra estado vazio criativo', async () => {
    await render(<HomeScreen />, { wrapper });
    await screen.findByText('Destaques');

    await fireEvent.changeText(screen.getByLabelText('Buscar'), 'xyz-inexistente');
    expect(await screen.findByText('Silêncio por aqui…')).toBeTruthy();
  });
});

describe('ProductCard', () => {
  it('adiciona ao pedido e vira seletor de quantidade', async () => {
    const croqueta = products.find((p) => p.id === 'qa-croqueta')!;
    await render(<ProductCard product={croqueta} />, { wrapper });

    await fireEvent.press(screen.getByLabelText('Adicionar Croqueta de costela ao pedido'));
    expect(selectCount(useCart.getState())).toBe(1);
    expect(screen.getByLabelText('Adicionar mais um Croqueta de costela')).toBeTruthy();
  });

  it('produto com opções abre o detalhe em vez de adicionar direto', async () => {
    const negroni = products.find((p) => p.id === 'qa-negroni')!;
    await render(<ProductCard product={negroni} />, { wrapper });

    await fireEvent.press(screen.getByLabelText('Adicionar Negroni de caju ao pedido'));
    expect(selectCount(useCart.getState())).toBe(0);
    expect(router.push).toHaveBeenCalledWith({ pathname: '/product/[id]', params: { id: 'qa-negroni' } });
  });
});
