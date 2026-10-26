import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme/tokens';

import { Text } from './Text';

type Tone = 'open' | 'closed' | 'promo' | 'brand' | 'neutral' | 'overlay';

interface BadgeProps {
  label: string;
  tone?: Tone;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

const tones: Record<Tone, { bg: string; fg: string; radius: number }> = {
  open: { bg: colors.brandTint, fg: colors.brand, radius: radius.pill },
  closed: { bg: 'rgba(255,90,78,0.14)', fg: colors.errorText, radius: radius.pill },
  promo: { bg: colors.warning, fg: colors.onBrand, radius: 6 },
  brand: { bg: colors.brand, fg: colors.onBrand, radius: radius.pill },
  neutral: { bg: colors.surface2, fg: colors.text2, radius: radius.pill },
  overlay: { bg: 'rgba(0,0,0,0.6)', fg: colors.brand, radius: radius.pill },
};

function BadgeBase({ label, tone = 'neutral', dot = false, style }: BadgeProps) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderRadius: t.radius }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: t.fg }]} /> : null}
      <Text variant="small" color={t.fg} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export const Badge = memo(BadgeBase);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    height: 26,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
