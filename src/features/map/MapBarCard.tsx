import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Cover } from '@/components/ui/Cover';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { toast } from '@/store/toast';
import { colors, radius, shadow, spacing } from '@/theme/tokens';
import type { Bar } from '@/types/domain';
import { formatDistance, formatPriceLevel, openingLabel } from '@/utils/format';

/** Card do bar selecionado no mapa (layout corrigido na revisão do design: sem altura fixa). */
function MapBarCardBase({ bar, width, now }: { bar: Bar; width: number; now: Date }) {
  const status = openingLabel(bar.hours, now);
  const open = () => router.push({ pathname: '/bar/[id]', params: { id: bar.id } });

  return (
    <View style={[styles.card, { width }]}>
      <PressableScale
        onPress={open}
        scaleTo={0.99}
        accessibilityLabel={`${bar.name}, ${status.label}, ${formatDistance(bar.distanceKm)}`}
        style={styles.top}
      >
        <Cover tone={bar.tone} uri={bar.image} icon="cocktail" iconSize={24} radius={radius.md} style={styles.thumb} />
        <View style={styles.info}>
          <Badge label={status.label} tone={status.open ? 'open' : 'closed'} dot style={styles.badge} />
          <Text variant="h2" numberOfLines={1} style={styles.name}>
            {bar.name}
          </Text>
          <Text variant="caption" color={colors.text3} numberOfLines={1}>
            {bar.category.split(' · ')[0]} · {formatPriceLevel(bar.priceLevel)} · {formatDistance(bar.distanceKm)} ·{' '}
            {bar.walkMinutes} min a pé
          </Text>
        </View>
      </PressableScale>
      <View style={styles.actions}>
        <Button label="Ver bar" size="md" onPress={open} style={styles.flex} />
        <IconButton
          icon="route"
          accessibilityLabel={`Rota até ${bar.name}`}
          size={48}
          onPress={() => toast(`Rota até ${bar.name}: ${bar.walkMinutes} min a pé`, 'info')}
        />
      </View>
    </View>
  );
}

export const MapBarCard = memo(MapBarCardBase);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: spacing.sm,
    ...shadow.floating,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  thumb: { width: 72, height: 72 },
  info: { flex: 1, minWidth: 0, gap: 4 },
  badge: { height: 22 },
  name: { fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 20, lineHeight: 24 },
  actions: { flexDirection: 'row', gap: spacing.xs },
  flex: { flex: 1 },
});
