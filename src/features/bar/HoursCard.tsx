import { router } from 'expo-router';
import { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/icons/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { colors, motion, radius, spacing } from '@/theme/tokens';
import type { Bar } from '@/types/domain';
import { openingLabel } from '@/utils/format';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

/** Horário + endereço. O horário expande para a semana inteira (expansão de componente). */
function HoursCardBase({ bar, now }: { bar: Bar; now: Date }) {
  const [expanded, setExpanded] = useState(false);
  const status = openingLabel(bar.hours, now);
  const today = now.getDay();
  const span = `${bar.hours.opens} – ${bar.hours.closes}`;

  const chevron = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(expanded ? '180deg' : '0deg', { duration: motion.duration.micro }) }],
  }));

  return (
    <Animated.View layout={LinearTransition.springify().damping(20)} style={styles.card}>
      <PressableScale
        onPress={() => setExpanded((e) => !e)}
        scaleTo={0.99}
        accessibilityLabel={`${status.label}. Hoje das ${bar.hours.opens} às ${bar.hours.closes}`}
        accessibilityHint={expanded ? 'Recolher horários da semana' : 'Ver horários da semana'}
        accessibilityState={{ expanded }}
        style={styles.row}
      >
        <View style={[styles.icon, { backgroundColor: status.open ? colors.brandTint : 'rgba(255,90,78,0.14)' }]}>
          <Icon name="clock" size={18} color={status.open ? colors.brand : colors.errorText} />
        </View>
        <View style={styles.texts}>
          <Text variant="bodyStrong" color={status.open ? colors.brand : colors.errorText}>
            {status.open ? 'Aberto agora' : 'Fechado agora'}
          </Text>
          <Text variant="caption" color={colors.text3}>
            Hoje das {bar.hours.opens.replace(':00', 'h')} às {bar.hours.closes.replace(':00', 'h')}
          </Text>
        </View>
        <Animated.View style={chevron}>
          <Icon name="chevronDown" size={18} color={colors.text3} />
        </Animated.View>
      </PressableScale>

      {expanded ? (
        <Animated.View entering={FadeIn.duration(motion.duration.micro)} exiting={FadeOut.duration(120)} style={styles.week}>
          {DAYS.map((d, i) => (
            <View key={d} style={styles.day}>
              <Text variant="caption" color={i === today ? colors.text1 : colors.text3} style={i === today && styles.bold}>
                {d}
                {i === today ? ' (hoje)' : ''}
              </Text>
              <Text variant="caption" color={i === today ? colors.text1 : colors.text3} style={i === today && styles.bold}>
                {span}
              </Text>
            </View>
          ))}
        </Animated.View>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.surface2 }]}>
          <Icon name="pin" size={18} color={colors.text1} />
        </View>
        <View style={styles.texts}>
          <Text variant="bodyStrong" style={styles.medium} numberOfLines={1}>
            {bar.address}
          </Text>
          <Text variant="caption" color={colors.text3} numberOfLines={1}>
            {bar.neighborhood}
          </Text>
        </View>
        <PressableScale
          onPress={() => router.navigate({ pathname: '/map', params: { focus: bar.id } })}
          accessibilityLabel={`Ver ${bar.name} no mapa`}
          style={styles.mapBtn}
        >
          <Text variant="small" color={colors.brand}>
            Ver no mapa
          </Text>
        </PressableScale>
      </View>
    </Animated.View>
  );
}

export const HoursCard = memo(HoursCardBase);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 14 },
  icon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, minWidth: 0, gap: 2 },
  medium: { fontFamily: 'Inter_500Medium' },
  week: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, paddingLeft: 64, gap: 6 },
  day: { flexDirection: 'row', justifyContent: 'space-between' },
  bold: { fontFamily: 'Inter_600SemiBold' },
  divider: { height: 1, backgroundColor: colors.surface2 },
  mapBtn: {
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
  },
});
