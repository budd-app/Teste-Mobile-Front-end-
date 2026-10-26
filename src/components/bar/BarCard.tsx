import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Cover } from '@/components/ui/Cover';
import { PressableScale } from '@/components/ui/PressableScale';
import { Rating } from '@/components/ui/Rating';
import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Bar } from '@/types/domain';
import { formatDistance, openingLabel } from '@/utils/format';

import { FavoriteButton } from './FavoriteButton';

interface Props {
  bar: Bar;
  now: Date;
}

function BarCardBase({ bar, now }: Props) {
  const status = openingLabel(bar.hours, now);
  const open = useCallback(() => router.push({ pathname: '/bar/[id]', params: { id: bar.id } }), [bar.id]);

  return (
    <View style={styles.card}>
      <PressableScale
        onPress={open}
        scaleTo={0.98}
        accessibilityLabel={`${bar.name}, ${bar.category}, ${formatDistance(bar.distanceKm)}, ${status.label}`}
        accessibilityHint="Abre o perfil do bar"
      >
        <Cover tone={bar.tone} uri={bar.image} icon="cocktail" radius={radius.xl} style={styles.cover}>
          <Badge label={status.label} tone={status.open ? 'overlay' : 'closed'} dot style={styles.status} />
        </Cover>
        <View style={styles.info}>
          <View style={styles.titles}>
            <Text variant="h3" numberOfLines={1}>
              {bar.name}
            </Text>
            <Text variant="caption" color={colors.text3} numberOfLines={1}>
              {bar.category} · {formatDistance(bar.distanceKm)}
            </Text>
          </View>
          <Rating value={bar.rating} />
        </View>
      </PressableScale>
      <View style={styles.fav}>
        <FavoriteButton barId={bar.id} barName={bar.name} />
      </View>
    </View>
  );
}

export const BarCard = memo(BarCardBase);

const styles = StyleSheet.create({
  card: { paddingHorizontal: spacing.xl },
  cover: { height: 180 },
  status: { position: 'absolute', top: 14, left: 14, height: 28 },
  fav: { position: 'absolute', top: 12, right: spacing.xl + 12 },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  titles: { flex: 1, minWidth: 0, gap: 4 },
});
