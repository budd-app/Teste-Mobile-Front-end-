import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBarInset } from '@/components/navigation/FloatingTabBar';
import { Badge } from '@/components/ui/Badge';
import { PressableScale } from '@/components/ui/PressableScale';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useOrders } from '@/store/orders';
import { colors, fonts, motion, radius, spacing } from '@/theme/tokens';
import type { OrderStatus } from '@/types/domain';
import { formatBRL } from '@/utils/format';

const STATUS: Record<OrderStatus, { label: string; tone: 'neutral' | 'brand' | 'open' }> = {
  paid: { label: 'Pago', tone: 'neutral' },
  preparing: { label: 'Preparando', tone: 'open' },
  ready: { label: 'Pronto pra retirar', tone: 'brand' },
};

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarInset();
  const orders = useOrders((s) => s.orders);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xs }]}>
      <Text variant="h1" accessibilityRole="header" style={styles.title}>
        Pedidos e ingressos
      </Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottom }, orders.length === 0 && styles.grow]}
        renderItem={({ item, index }) => {
          const s = STATUS[item.status];
          const count = item.items.reduce((a, i) => a + i.qty, 0);
          return (
            <Animated.View entering={FadeInDown.delay(index * motion.stagger)}>
              <PressableScale
                onPress={() => router.push({ pathname: '/order/[id]', params: { id: item.id } })}
                scaleTo={0.98}
                accessibilityLabel={`Pedido ${item.code} no ${item.barName}, ${s.label}, ${formatBRL(item.total)}`}
                style={styles.card}
              >
                <View style={styles.code}>
                  <Text style={styles.codeText}>{item.code}</Text>
                </View>
                <View style={styles.flex}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {item.barName}
                  </Text>
                  <Text variant="caption" color={colors.text3}>
                    {count} {count === 1 ? 'item' : 'itens'} · {formatBRL(item.total)}
                  </Text>
                  <Badge label={s.label} tone={s.tone} dot={item.status !== 'paid'} style={styles.badge} />
                </View>
              </PressableScale>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <StateView
              kind="empty"
              icon="ticket"
              title="Nenhum pedido ainda"
              message="Peça um drink ou garanta um ingresso: tudo que você comprar aparece aqui, com o código de retirada."
              actionLabel="Explorar bares"
              onAction={() => router.navigate('/')}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm },
  grow: { flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center' },
  flex: { flex: 1, minWidth: 0, gap: 3 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  code: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: { fontFamily: fonts.display, fontSize: 18, color: colors.brand, letterSpacing: 1 },
  badge: { marginTop: 4 },
});
