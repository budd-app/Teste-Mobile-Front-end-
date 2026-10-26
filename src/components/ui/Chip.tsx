import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icons/Icon';
import { colors, motion, radius, spacing } from '@/theme/tokens';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

type Tone = 'solid' | 'soft';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  /** solid = fundo lime (filtros); soft = contorno lime (preferências). */
  tone?: Tone;
  size?: 'md' | 'lg';
}

function ChipBase({ label, selected, onPress, icon, tone = 'solid', size = 'md' }: ChipProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(selected ? 1 : 0, { duration: motion.duration.micro }));
  }, [progress, selected]);

  const activeBg = tone === 'solid' ? colors.brand : colors.brandTint;
  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface1, activeBg]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.brand]),
  }));

  const fg = selected ? (tone === 'solid' ? colors.onBrand : colors.brand) : colors.text1;

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={size === 'lg' ? styles.hitLg : styles.hit}
    >
      <Animated.View style={[styles.chip, size === 'lg' && styles.lg, containerStyle]}>
        {selected && tone === 'solid' && !icon ? <Icon name="check" size={15} color={fg} strokeWidth={2.6} /> : null}
        {icon ? (
          <View style={styles.icon}>
            <Icon name={icon} size={16} color={fg} />
          </View>
        ) : null}
        <Text variant="label" color={fg} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

export const Chip = memo(ChipBase);

const styles = StyleSheet.create({
  hit: { minHeight: 44, justifyContent: 'center' },
  hitLg: { minHeight: 44, justifyContent: 'center' },
  chip: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lg: { height: 44 },
  icon: { marginLeft: -4 },
});
