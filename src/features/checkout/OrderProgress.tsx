import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { colors, motion, spacing } from '@/theme/tokens';
import type { OrderStatus } from '@/types/domain';

const STEPS: { id: OrderStatus; label: string }[] = [
  { id: 'paid', label: 'Pago' },
  { id: 'preparing', label: 'Preparando' },
  { id: 'ready', label: 'Pronto' },
];

/** Linha do tempo do pedido; a barra "enche" a cada mudança de status. */
function OrderProgressBase({ status }: { status: OrderStatus }) {
  const current = STEPS.findIndex((s) => s.id === status);
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.set(withTiming(current / (STEPS.length - 1), { duration: 500 }));
  }, [current, fill]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Status do pedido: ${STEPS[current].label}`}
      style={styles.wrap}
    >
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
        <View style={styles.dots}>
          {STEPS.map((s, i) => (
            <Dot key={s.id} done={i <= current} active={i === current} />
          ))}
        </View>
      </View>
      <View style={styles.labels}>
        {STEPS.map((s, i) => (
          <Text key={s.id} variant="small" color={i === current ? colors.text1 : colors.text3}>
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function Dot({ done, active }: { done: boolean; active: boolean }) {
  const scale = useSharedValue(done ? 1 : 0.8);
  useEffect(() => {
    scale.set(withSpring(active ? 1.25 : done ? 1 : 0.8, motion.spring));
  }, [active, done, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: done ? colors.brand : colors.border }, active && styles.dotActive, style]}
    />
  );
}

export const OrderProgress = memo(OrderProgressBase);

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: spacing.xs },
  track: { height: 12, justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, height: 3, borderRadius: 2, backgroundColor: colors.brand },
  dots: { flexDirection: 'row', justifyContent: 'space-between' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotActive: { shadowColor: colors.brand, shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
});
