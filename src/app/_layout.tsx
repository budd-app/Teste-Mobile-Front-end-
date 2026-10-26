// Import por peso (subpath): importar do índice do pacote embute TODAS as variações (~6 MB a mais).
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/ui/ToastHost';
import { AnimatedSplash } from '@/features/splash/AnimatedSplash';
import { queryClient } from '@/services/queries';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 200 });
SystemUI.setBackgroundColorAsync(colors.bg);

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    primary: colors.brand,
    text: colors.text1,
    border: colors.border,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [introDone, setIntroDone] = useState(false);
  const ready = fontsLoaded || !!fontError;

  // Troca a splash nativa (fundo preto + ponto) pela animada sem "piscar".
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  const finishIntro = useCallback(() => setIntroDone(true), []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={theme}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="assistant" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen
                name="filters"
                options={{
                  presentation: 'transparentModal',
                  animation: 'fade',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              />
              <Stack.Screen name="product/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="order/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
            </Stack>
            <ToastHost />
            {!introDone ? <AnimatedSplash onFinish={finishIntro} /> : null}
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
