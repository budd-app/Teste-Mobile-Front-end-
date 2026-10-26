import { QueryClient, useQuery } from '@tanstack/react-query';

import { api, NotFoundError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      // 404 não melhora tentando de novo; falha de rede tenta 1x.
      retry: (count, error) => !(error instanceof NotFoundError) && count < 1,
    },
  },
});

/** Query keys centralizadas: evita string solta e facilita invalidação. */
export const keys = {
  home: ['home'] as const,
  bar: (id: string) => ['bar', id] as const,
  menu: (barId: string) => ['menu', barId] as const,
  product: (id: string) => ['product', id] as const,
};

export const useHomeFeed = () => useQuery({ queryKey: keys.home, queryFn: api.getHomeFeed });

export const useBar = (id: string) => useQuery({ queryKey: keys.bar(id), queryFn: () => api.getBar(id), enabled: !!id });

export const useMenu = (barId: string) =>
  useQuery({ queryKey: keys.menu(barId), queryFn: () => api.getMenu(barId), enabled: !!barId });

export const useProduct = (id: string) =>
  useQuery({ queryKey: keys.product(id), queryFn: () => api.getProduct(id), enabled: !!id });
