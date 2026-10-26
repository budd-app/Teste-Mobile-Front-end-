import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { OrderProgress } from '@/features/checkout/OrderProgress';
import { useOrders } from '@/store/orders';
import { colors, fonts, motion, palette, radius, spacing } from '@/theme/tokens';
import { formatBRL } from '@/utils/format';

/** Partículas do "estouro" de sucesso: ângulo, distância e cor. */
const BURST = [
  { a: -80, d: 92, c: palette.lime500, s: 8 },
  { a: -30, d: 100, c: palette.pink, s: 6 },
  { a: 15, d: 96, c: palette.amber, s: 10 },
  { a: 60, d: 90, c: palette.violet, s: 6 },
  { a: 120, d: 98, c: palette.lime500, s: 7 },
  { a: 165, d: 92, c: palette.cyan, s: 8 },
  { a: 210, d: 100, c: palette.amber, s: 6 },
  { a: 250, d: 94, c: palette.pink, s: 9 },
];

function Particle({ a, d, c, s }: (typeof BURST)[number]) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(180, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })));
  }, [t]);
  const rad = (a * Math.PI) / 180;
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.7 ? 1 : 1 - (t.value - 0.7) / 0.3,
    transform: [
      { translateX: Math.cos(rad) * d * t.value },
      { translateY: Math.sin(rad) * d * t.value },
      { scale: 0.4 + t.value * 0.6 },
    ],
  }));
  return <Animated.View style={[styles.particle, { width: s, height: s, borderRadius: s / 2, backgroundColor: c }, style]} />;
}

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));

  const check = useSharedValue(0);
  const ring = useSharedValue(0);
  useEffect(() => {
    check.set(withSequence(withSpring(1.15, motion.spring), withSpring(1, motion.spring)));
    ring.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, [check, ring]);

  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: check.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: 0.4 * (1 - ring.value), transform: [{ scale: 1 + ring.value * 1.2 }] }));

  if (!order) {
    return (
      <View style={[styles.root, styles.center]}>
        <StateView
          kind="empty"
          icon="ticket"
          title="Pedido não encontrado"
          message="Ele pode ter sido concluído."
          actionLabel="Voltar ao início"
          onAction={() => router.replace('/')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.huge, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.hero} accessible accessibilityRole="image" accessibilityLabel="Pedido confirmado">
        <Animated.View style={[styles.ring, ringStyle]} />
        {BURST.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
        <Animated.View style={[styles.check, checkStyle]}>
          <Icon name="check" size={48} color={colors.onBrand} strokeWidth={2.6} />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(250).duration(motion.duration.enter)} style={styles.texts}>
        <Text variant="h1" align="center" accessibilityRole="header" style={styles.title}>
          Pedido confirmado!
        </Text>
        <Text variant="body" color={colors.text2} align="center" style={styles.sub}>
          Mostre o código no balcão do {order.barName}. A gente avisa quando estiver pronto.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(330).duration(motion.duration.enter)} style={styles.card}>
        <Text variant="overline" color={colors.text3}>
          Código de retirada
        </Text>
        <Text style={styles.code} accessibilityLabel={`Código ${order.code.split('').join(' ')}`}>
          {order.code}
        </Text>
        <OrderProgress status={order.status} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(motion.duration.enter)} style={styles.cashback}>
        <Icon name="sparkle" size={18} color={colors.brand} filled strokeWidth={0} />
        <Text variant="body" style={styles.flex}>
          Você ganhou{' '}
          <Text variant="bodyStrong" color={colors.brand}>
            {formatBRL(order.cashback)}
          </Text>{' '}
          de cashback
        </Text>
      </Animated.View>

      <View style={styles.actions}>
        <Button label="Acompanhar pedido" onPress={() => router.replace('/orders')} />
        <Button label="Voltar ao início" variant="ghost" size="md" onPress={() => router.replace('/')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl, alignItems: 'center' },
  center: { justifyContent: 'center' },
  flex: { flex: 1 },
  hero: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: colors.brand },
  particle: { position: 'absolute' },
  check: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand,
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  texts: { gap: 10, marginTop: spacing.lg },
  title: { fontSize: 32, lineHeight: 36 },
  sub: { maxWidth: 300 },
  card: {
    marginTop: spacing.xxl,
    width: '100%',
    borderRadius: radius.xl,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 14,
  },
  code: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: 6, color: colors.brand },
  cashback: {
    marginTop: 14,
    width: '100%',
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(118,235,60,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
  },
  actions: { marginTop: 'auto', width: '100%', gap: spacing.xs },
});
