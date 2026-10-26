import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { selectCount, selectSubtotal, useCart } from '@/store/cart';
import { colors, radius, shadow, spacing } from '@/theme/tokens';
import { formatBRL } from '@/utils/format';

export const CART_BAR_SPACE = 64 + spacing.xl;

/** Barra do pedido: entra deslizando quando há itens e o número "pula" a cada mudança. */
function CartBarBase() {
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const insets = useSafeAreaInsets();

  if (count === 0) return null;

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18)}
      exiting={SlideOutDown.duration(200)}
      style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.md) + spacing.xs }]}
    >
      <PressableScale
        onPress={() => router.push('/checkout')}
        haptic="medium"
        accessibilityLabel={`Ver pedido: ${count} ${count === 1 ? 'item' : 'itens'}, ${formatBRL(subtotal)}`}
        style={styles.bar}
      >
        <Animated.View key={count} entering={ZoomIn.duration(180)} style={styles.count}>
          <Text variant="label" color={colors.brand}>
            {count}
          </Text>
        </Animated.View>
        <Text variant="bodyStrong" color={colors.onBrand} style={styles.label}>
          Ver pedido
        </Text>
        <View style={styles.total}>
          <Text variant="bodyStrong" color={colors.onBrand} style={styles.label}>
            {formatBRL(subtotal)}
          </Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export const CartBar = memo(CartBarBase);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.md, right: spacing.md },
  bar: {
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    gap: spacing.sm,
    ...shadow.brandGlow,
  },
  count: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.onBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16 },
  total: {
    marginLeft: 'auto',
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
  },
});
