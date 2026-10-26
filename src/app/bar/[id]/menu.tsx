import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { CART_BAR_SPACE, CartBar } from '@/components/product/CartBar';
import { ProductCard } from '@/components/product/ProductCard';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { bars } from '@/data/bars';
import { useMenu } from '@/services/queries';
import { categories, categoryOrder } from '@/theme/categories';
import { colors, motion, radius, spacing } from '@/theme/tokens';
import type { CategoryId, Product } from '@/types/domain';

type Tab = 'all' | CategoryId;

export default function MenuScreen() {
  const { id, category } = useLocalSearchParams<{ id: string; category?: CategoryId }>();
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch } = useMenu(id);
  const [tab, setTab] = useState<Tab>(category ?? 'all');
  const barName = bars.find((b) => b.id === id)?.name ?? '';

  const items = useMemo(() => (data ?? []).filter((p) => tab === 'all' || p.category === tab), [data, tab]);
  const title = tab === 'all' ? 'Mais pedidos' : categories[tab].label;

  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item, index }) => (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index, 6) * motion.stagger).duration(motion.duration.enter)}
        layout={LinearTransition.springify().damping(20)}
      >
        <ProductCard product={item} />
      </Animated.View>
    ),
    [],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <IconButton
          icon="chevronLeft"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          iconSize={22}
          variant="surface"
        />
        <View style={styles.flex}>
          <Text variant="caption" color={colors.text3} numberOfLines={1}>
            {barName}
          </Text>
          <Text variant="h2" style={styles.heading} accessibilityRole="header">
            Cardápio
          </Text>
        </View>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          accessibilityRole="tablist"
        >
          <CategoryTab label="Tudo" selected={tab === 'all'} onPress={() => setTab('all')} />
          {categoryOrder.map((c) => (
            <CategoryTab key={c} category={c} label={categories[c].label} selected={tab === c} onPress={() => setTab(c)} />
          ))}
        </ScrollView>
      </View>

      {isPending ? (
        <SkeletonGroup>
          <View style={styles.list}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={150} radius={radius.xl} />
            ))}
          </View>
        </SkeletonGroup>
      ) : isError ? (
        <StateView
          kind="error"
          icon="wifiOff"
          title="Caiu o sinal"
          message="Não deu pra carregar o cardápio."
          actionLabel="Tentar de novo"
          onAction={() => refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: CART_BAR_SPACE + insets.bottom + spacing.xl }]}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text variant="h2" style={styles.sectionTitle}>
                {title}
              </Text>
              <Text variant="caption" color={colors.text3}>
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <StateView
              kind="empty"
              icon={tab === 'all' ? 'cocktail' : categories[tab].icon}
              title="Nada por aqui ainda"
              message={`${barName} não tem ${tab === 'all' ? 'itens' : categories[tab].label.toLowerCase()} no app por enquanto.`}
              actionLabel="Ver tudo"
              onAction={() => setTab('all')}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <CartBar />
    </View>
  );
}

function CategoryTab({
  label,
  selected,
  onPress,
  category,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  category?: CategoryId;
}) {
  const meta = category ? categories[category] : null;
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.tab, meta && styles.tabWithIcon, selected && styles.tabOn]}
    >
      {meta ? (
        <View style={[styles.tabIcon, { backgroundColor: selected ? 'rgba(0,0,0,0.12)' : colors.surface2 }]}>
          <Icon name={meta.icon} size={18} color={selected ? colors.onBrand : meta.color} />
        </View>
      ) : null}
      <Text variant="label" color={selected ? colors.onBrand : colors.text1}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  heading: { fontFamily: 'BricolageGrotesque_800ExtraBold' },
  tabs: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xs, gap: spacing.xs },
  tab: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tabWithIcon: { paddingLeft: 6 },
  tabOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  tabIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.sm },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: spacing.xxs },
  sectionTitle: { fontSize: 20 },
});
