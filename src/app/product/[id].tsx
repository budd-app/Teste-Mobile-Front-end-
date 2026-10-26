import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/bar/FavoriteButton';
import { Icon } from '@/components/icons/Icon';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Cover } from '@/components/ui/Cover';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useProduct } from '@/services/queries';
import { useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import { categories } from '@/theme/categories';
import { colors, motion, radius, spacing } from '@/theme/tokens';
import { formatBRL, formatBRLShort } from '@/utils/format';

const COVER_H = 330;
const MAX_QTY = 20;

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch } = useProduct(id);
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [optionId, setOptionId] = useState<string | undefined>(undefined);

  if (isPending) {
    return (
      <View style={styles.root}>
        <SkeletonGroup>
          <Skeleton height={COVER_H} radius={0} />
          <View style={styles.skeletonBody}>
            <Skeleton width={120} height={28} radius={radius.pill} />
            <Skeleton width="70%" height={30} />
            <Skeleton height={44} />
          </View>
        </SkeletonGroup>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.root, styles.center]}>
        <StateView
          kind="error"
          icon="wifiOff"
          title="Caiu o sinal"
          message="Não deu pra abrir o produto."
          actionLabel="Tentar de novo"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  const { product, bar } = data;
  const meta = categories[product.category];
  const options = product.options ?? [];
  const selected = options.find((o) => o.id === (optionId ?? options[0]?.id));
  const unit = product.price + (selected?.extra ?? 0);

  const onAdd = () => {
    const { replaced } = add(product, qty, selected);
    toast(replaced ? `Carrinho trocado para ${bar.name}` : `${qty}× ${product.name} no pedido`, replaced ? 'info' : 'success');
    router.back();
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }} bounces={false}>
        <Cover
          tone={product.tone}
          uri={product.image}
          icon={meta.icon}
          iconSize={96}
          style={styles.cover}
          accessibilityLabel={`Foto de ${product.name}`}
        />

        <View style={styles.sheet}>
          <Animated.View entering={FadeInDown.duration(motion.duration.enter)} style={styles.rowBetween}>
            <View style={[styles.tag, { backgroundColor: meta.tint }]}>
              <CategoryIcon category={product.category} size={24} />
              <Text variant="label" color={meta.color}>
                {meta.label}
              </Text>
            </View>
            <Text variant="caption" color={colors.text3} numberOfLines={1} style={styles.barName}>
              {bar.name}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(40).duration(motion.duration.enter)} style={styles.titleRow}>
            <Text variant="h1" accessibilityRole="header" style={styles.title}>
              {product.name}
            </Text>
            <View style={styles.priceCol}>
              <Text variant="h1" color={colors.brand} style={styles.price}>
                {formatBRLShort(product.price)}
              </Text>
              {product.promo ? (
                <Text variant="small" color={colors.text3} style={styles.strike}>
                  {formatBRLShort(product.promo.originalPrice)}
                </Text>
              ) : null}
            </View>
          </Animated.View>

          {product.promo ? <Badge label={`Promoção ${product.promo.label}`} tone="promo" /> : null}

          <Animated.Text
            entering={FadeInDown.delay(80).duration(motion.duration.enter)}
            style={styles.desc}
            maxFontSizeMultiplier={1.4}
          >
            {product.description}
          </Animated.Text>

          {product.tags?.length ? (
            <View style={styles.tags}>
              {product.tags.map((t) => (
                <View key={t} style={styles.chip}>
                  <Text variant="caption">{t}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {options.length ? (
            <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Escolha uma opção">
              <Text variant="overline" color={colors.text3}>
                Escolha uma opção
              </Text>
              {options.map((o) => {
                const on = o.id === selected?.id;
                return (
                  <PressableScale
                    key={o.id}
                    onPress={() => setOptionId(o.id)}
                    haptic="selection"
                    scaleTo={0.98}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={`${o.label}, ${o.extra ? `mais ${formatBRL(o.extra)}` : 'incluso'}`}
                    style={[styles.option, on && styles.optionOn]}
                  >
                    <View style={[styles.radio, on && styles.radioOn]}>
                      {on ? <Animated.View entering={ZoomIn.duration(140)} style={styles.radioDot} /> : null}
                    </View>
                    <Text variant="body" style={styles.optionLabel}>
                      {o.label}
                    </Text>
                    <Text variant="caption" color={colors.text3}>
                      {o.extra ? `+ ${formatBRLShort(o.extra)}` : 'incluso'}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, spacing.md) }]} pointerEvents="box-none">
        <IconButton
          icon="chevronDown"
          variant="overlay"
          accessibilityLabel="Fechar"
          onPress={() => router.back()}
          iconSize={22}
        />
        <FavoriteButton barId={bar.id} barName={bar.name} />
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.stepper} accessibilityRole="adjustable" accessibilityLabel={`Quantidade: ${qty}`}>
          <PressableScale
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            haptic="selection"
            accessibilityLabel="Diminuir quantidade"
            style={styles.stepBtn}
          >
            <Icon name="minus" size={18} color={qty <= 1 ? colors.disabled : colors.text1} strokeWidth={2.4} />
          </PressableScale>
          <Animated.View key={qty} entering={ZoomIn.duration(150)}>
            <Text variant="h3" style={styles.qty} accessibilityLiveRegion="polite">
              {qty}
            </Text>
          </Animated.View>
          <PressableScale
            onPress={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
            disabled={qty >= MAX_QTY}
            haptic="selection"
            accessibilityLabel="Aumentar quantidade"
            style={styles.stepBtn}
          >
            <Icon name="plus" size={18} color={colors.text1} strokeWidth={2.4} />
          </PressableScale>
        </View>
        <Button label="Adicionar" trailing={formatBRL(unit * qty)} onPress={onAdd} haptic="success" style={styles.addBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center' },
  cover: { height: COVER_H },
  skeletonBody: { padding: spacing.xl, gap: spacing.md },
  sheet: {
    marginTop: -32,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: spacing.sm,
    paddingLeft: 3,
    height: 30,
    borderRadius: radius.pill,
  },
  barName: { flexShrink: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { flex: 1, fontSize: 30, lineHeight: 34 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 24, lineHeight: 30 },
  strike: { textDecorationLine: 'line-through' },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22, color: colors.text2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.surface1,
    justifyContent: 'center',
  },
  options: { gap: spacing.xs, marginTop: spacing.xs },
  option: {
    minHeight: 56,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionOn: { borderColor: colors.brand, borderWidth: 1.5, backgroundColor: 'rgba(118,235,60,0.08)' },
  optionLabel: { flex: 1, fontFamily: 'Inter_500Medium' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.brand },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepper: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { minWidth: 22, textAlign: 'center' },
  addBtn: { flex: 1, paddingHorizontal: spacing.lg },
});
