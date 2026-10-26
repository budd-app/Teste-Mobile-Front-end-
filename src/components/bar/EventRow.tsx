import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { colors, palette, radius, spacing } from '@/theme/tokens';
import type { BarEvent } from '@/types/domain';
import { eventDateParts, formatBRLShort } from '@/utils/format';

interface Props {
  event: BarEvent;
  meta: string;
  /** "accent" = card roxo de destaque (perfil do bar). */
  variant?: 'plain' | 'accent';
}

function EventRowBase({ event, meta, variant = 'plain' }: Props) {
  const { dow, day } = eventDateParts(event.date);
  const price = event.price === null ? 'Grátis' : formatBRLShort(event.price);
  const accent = variant === 'accent';

  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/bar/[id]/menu', params: { id: event.barId, category: 'ticket' } })}
      scaleTo={0.98}
      accessibilityLabel={`${event.title}, ${dow} dia ${day}, ${meta}, ${price}`}
      accessibilityHint="Ver ingressos"
      style={[styles.row, accent && styles.accentRow]}
    >
      <View style={[styles.date, accent && styles.accentDate]}>
        <Text variant="small" color={accent ? colors.onBrand : colors.text3} style={styles.dow}>
          {dow}
        </Text>
        <Text variant="h2" color={accent ? colors.onBrand : colors.text1} style={styles.day}>
          {day}
        </Text>
      </View>
      <View style={styles.info}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {event.title}
        </Text>
        <Text variant="caption" color={accent ? palette.violetSoft : colors.text3} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      <View style={[styles.price, accent && styles.accentPrice]}>
        <Text variant="label" color={accent ? colors.onBrand : palette.violetSoft}>
          {accent ? 'Ingresso' : price}
        </Text>
      </View>
    </PressableScale>
  );
}

export const EventRow = memo(EventRowBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  accentRow: { backgroundColor: '#1A1530', borderColor: '#2E2650', padding: spacing.md },
  date: {
    width: 56,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentDate: { backgroundColor: palette.violet },
  dow: { fontSize: 11, letterSpacing: 0.6 },
  day: { fontFamily: 'BricolageGrotesque_800ExtraBold', lineHeight: 24 },
  info: { flex: 1, minWidth: 0, gap: 3 },
  price: {
    height: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(169,139,255,0.16)',
    justifyContent: 'center',
  },
  accentPrice: { height: 40, backgroundColor: palette.violet },
});
