import { memo, useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icons/Icon';
import { colors, radius, spacing } from '@/theme/tokens';

import { PressableScale, type HapticKind } from './PressableScale';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  /** Texto à direita (ex.: total do pedido). */
  trailing?: string;
  loading?: boolean;
  disabled?: boolean;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

const palettes: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.brand, fg: colors.onBrand },
  secondary: { bg: colors.surface2, fg: colors.text1, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.brand },
};

function LoadingDot({ index, color }: { index: number; color: string }) {
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.set(
      withDelay(index * 120, withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })), -1)),
    );
  }, [index, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

function ButtonBase({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  trailing,
  loading = false,
  disabled = false,
  haptic = 'light',
  style,
  accessibilityHint,
}: ButtonProps) {
  const p = palettes[variant];
  const isDisabled = disabled || loading;
  const bg = disabled ? colors.surface2 : p.bg;
  const fg = disabled ? colors.disabled : p.fg;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      haptic={haptic}
      accessibilityLabel={trailing ? `${label}, ${trailing}` : label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: bg },
        p.border && !disabled ? { borderWidth: 1, borderColor: p.border } : null,
        trailing ? styles.split : null,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <LoadingDot key={i} index={i} color={fg} />
          ))}
        </View>
      ) : (
        <>
          <View style={styles.content}>
            {icon ? <Icon name={icon} size={20} color={fg} strokeWidth={2.2} /> : null}
            <Text variant="bodyStrong" color={fg} numberOfLines={1} style={styles.label}>
              {label}
            </Text>
          </View>
          {trailing ? (
            <Text variant="bodyStrong" color={fg} style={styles.label}>
              {trailing}
            </Text>
          ) : null}
        </>
      )}
    </PressableScale>
  );
}

export const Button = memo(ButtonBase);

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
  },
  lg: { height: 56 },
  md: { height: 48, paddingHorizontal: spacing.lg },
  split: { justifyContent: 'space-between' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
  label: { fontSize: 16 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
