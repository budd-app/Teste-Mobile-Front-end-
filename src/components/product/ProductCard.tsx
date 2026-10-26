import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Cover } from '@/components/ui/Cover';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { categories } from '@/theme/categories';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Product } from '@/types/domain';
import { formatBRL, formatBRLShort } from '@/utils/format';

import { AddToCartControl } from './AddToCartControl';

interface Props {
  product: Product;
  /** "row" = lista do catálogo; "tile" = carrossel do perfil do bar. */
  variant?: 'row' | 'tile';
}

function ProductCardBase({ product, variant = 'row' }: Props) {
  const meta = categories[product.category];
  const open = useCallback(() => router.push({ pathname: '/product/[id]', params: { id: product.id } }), [product.id]);
  const label = `${product.name}, ${meta.label}, ${formatBRL(product.price)}${product.promo ? `, promoção ${product.promo.label}` : ''}`;

  if (variant === 'tile') {
    return (
      <View style={styles.tile}>
        <PressableScale onPress={open} scaleTo={0.97} accessibilityLabel={label} accessibilityHint="Ver detalhes">
          <Cover tone={product.tone} uri={product.image} icon={meta.icon} style={styles.tileCover}>
            <View style={styles.tileIcon}>
              <CategoryIcon category={product.category} variant="overlay" />
            </View>
            {product.promo ? <Badge label={product.promo.label} tone="promo" style={styles.tilePromo} /> : null}
          </Cover>
        </PressableScale>
        <View style={styles.tileInfo}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {product.name}
          </Text>
          <View style={styles.tileFooter}>
            <Text variant="bodyStrong" color={colors.brand}>
              {formatBRLShort(product.price)}
            </Text>
            <AddToCartControl product={product} onNeedsOptions={open} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <PressableScale onPress={open} scaleTo={0.97} accessibilityLabel={label} accessibilityHint="Ver detalhes">
        <Cover tone={product.tone} uri={product.image} icon={meta.icon} iconSize={32} radius={radius.md} style={styles.rowCover}>
          {product.promo ? <Badge label={product.promo.label} tone="promo" style={styles.rowPromo} /> : null}
        </Cover>
      </PressableScale>
      <View style={styles.rowInfo}>
        <View style={[styles.tag, { backgroundColor: colors.surface2 }]}>
          <CategoryIcon category={product.category} size={18} />
          <Text variant="small" color={meta.color} style={styles.tagText}>
            {meta.label}
          </Text>
        </View>
        <PressableScale onPress={open} scaleTo={1} accessibilityElementsHidden importantForAccessibility="no">
          <Text variant="h3" numberOfLines={1} style={styles.name}>
            {product.name}
          </Text>
          <Text variant="caption" color={colors.text3} numberOfLines={2} style={styles.desc}>
            {product.description}
          </Text>
        </PressableScale>
        <View style={styles.rowFooter}>
          <View style={styles.prices}>
            <Text variant="bodyStrong" style={styles.price}>
              {formatBRL(product.price)}
            </Text>
            {product.promo ? (
              <Text variant="small" color={colors.text3} style={styles.strike}>
                {formatBRL(product.promo.originalPrice)}
              </Text>
            ) : null}
          </View>
          <AddToCartControl product={product} onNeedsOptions={open} />
        </View>
      </View>
    </View>
  );
}

export const ProductCard = memo(ProductCardBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  rowCover: { width: 104, height: 124 },
  rowPromo: { position: 'absolute', top: 8, left: 8, height: 22, paddingHorizontal: 7 },
  rowInfo: { flex: 1, minWidth: 0, gap: 6 },
  tag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
    borderRadius: radius.pill,
  },
  tagText: { fontSize: 11 },
  name: { fontSize: 16 },
  desc: { marginTop: 2 },
  rowFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  prices: { flexShrink: 1, gap: 0 },
  price: { fontSize: 16 },
  strike: { textDecorationLine: 'line-through', fontFamily: 'Inter_400Regular' },
  tile: {
    width: 168,
    borderRadius: radius.xl,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
    overflow: 'hidden',
  },
  tileCover: { height: 120 },
  tileIcon: { position: 'absolute', top: 10, left: 10 },
  tilePromo: { position: 'absolute', top: 12, right: 10, height: 22, paddingHorizontal: 7 },
  tileInfo: { padding: spacing.sm, gap: 6 },
  tileFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
