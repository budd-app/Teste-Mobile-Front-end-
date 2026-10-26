/* eslint-env jest */
// Navegação e haptics não existem no ambiente de teste: substituídos por dublês.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Error: 'error' },
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() },
  // Cada teste define os params da rota em globalThis.__routeParams.
  useLocalSearchParams: () => globalThis.__routeParams ?? {},
}));
