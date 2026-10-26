import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Cover } from '@/components/ui/Cover';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Promo } from '@/types/domain';
import { formatBRL } from '@/utils/format';

function PromoCardBase({ promo }: { promo: Promo }) {
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/bar/[id]/menu', params: { id: promo.barId } })}
      accessibilityLabel={`Promoção ${promo.badge}: ${promo.title}, ${promo.subtitle}${promo.price ? `, ${formatBRL(promo.price)}` : ''}`}
      style={styles.card}
    >
      <Cover tone={promo.tone} icon="tag" iconSize={28} radius={radius.md} style={styles.thumb}>
        <Badge label={promo.badge} tone="promo" style={styles.badge} />
      </Cover>
      <View style={styles.info}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {promo.title}
        </Text>
        <Text variant="small" color={colors.text3} numberOfLines={1} style={styles.sub}>
          {promo.subtitle}
        </Text>
        {promo.price ? (
          <View style={styles.prices}>
            <Text variant="label" color={colors.brand}>
              {formatBRL(promo.price)}
            </Text>
            {promo.originalPrice ? (
              <Text variant="small" color={colors.text3} style={styles.strike}>
                {formatBRL(promo.originalPrice)}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

export const PromoCard = memo(PromoCardBase);

const styles = StyleSheet.create({
  card: {
    width: 264,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  thumb: { width: 76, height: 76 },
  badge: { position: 'absolute', top: 6, left: 6, height: 22, paddingHorizontal: 7 },
  info: { flex: 1, minWidth: 0, gap: 3 },
  sub: { fontFamily: 'Inter_500Medium' },
  prices: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  strike: { textDecorationLine: 'line-through', fontFamily: 'Inter_400Regular' },
});
