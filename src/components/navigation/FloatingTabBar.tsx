import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { colors, radius, shadow, spacing } from '@/theme/tokens';

export const TAB_BAR_HEIGHT = 72;

/** Espaço que o conteúdo rolável deve reservar para não ficar atrás da barra. */
export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, spacing.md) + spacing.xl;
}

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Início', icon: 'home' },
  map: { label: 'Mapa', icon: 'map' },
  orders: { label: 'Pedidos', icon: 'ticket' },
  profile: { label: 'Perfil', icon: 'user' },
};

function TabItem({ label, icon, focused, onPress }: { label: string; icon: IconName; focused: boolean; onPress: () => void }) {
  const color = focused ? colors.brand : colors.text3;
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      style={styles.item}
    >
      <Icon name={icon} size={24} color={color} />
      <Text variant="small" color={color} style={[styles.label, !focused && styles.labelIdle]}>
        {label}
      </Text>
    </PressableScale>
  );
}

/**
 * Barra flutuante com o budd AI em destaque no centro. O botão central não
 * é uma aba: abre o assistente por cima de qualquer tela.
 */
function FloatingTabBarBase({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const items = state.routes.map((route, index) => {
    const meta = TABS[route.name];
    if (!meta) return null;
    const focused = state.index === index;
    const onPress = () => {
      if (!focused) navigateToTab(route.key);
    };
    return <TabItem key={route.key} label={meta.label} icon={meta.icon} focused={focused} onPress={onPress} />;
  });

  const half = Math.ceil(items.length / 2);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {items.slice(0, half)}
        <PressableScale
          onPress={() => router.push('/assistant')}
          haptic="medium"
          accessibilityLabel="budd AI, assistente"
          accessibilityHint="Abre o assistente para montar seu rolê"
          style={styles.ai}
        >
          <Icon name="sparkle" size={26} color={colors.onBrand} filled strokeWidth={0} />
        </PressableScale>
        {items.slice(half)}
      </View>
    </View>
  );
}

export const FloatingTabBar = memo(FloatingTabBarBase);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.md, right: spacing.md },
  bar: {
    height: TAB_BAR_HEIGHT,
    borderRadius: radius.xxl,
    backgroundColor: 'rgba(20,22,20,0.96)',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    ...shadow.floating,
  },
  item: { minWidth: 56, height: 56, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontSize: 11 },
  labelIdle: { fontFamily: 'Inter_500Medium' },
  ai: {
    width: 60,
    height: 60,
    marginTop: -28,
    borderRadius: 22,
    backgroundColor: colors.brand,
    borderWidth: 4,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.brandGlow,
  },
});
