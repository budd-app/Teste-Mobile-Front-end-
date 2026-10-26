import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icons/Icon';
import { colors, hitSize, radius } from '@/theme/tokens';

import { PressableScale, type HapticKind } from './PressableScale';

type Variant = 'surface' | 'overlay' | 'brand' | 'plain';

interface IconButtonProps {
  icon: IconName;
  /** Obrigatório: botões só com ícone precisam de nome para leitores de tela. */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: Variant;
  size?: number;
  iconSize?: number;
  filled?: boolean;
  selected?: boolean;
  badge?: boolean;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
}

const variants: Record<Variant, { bg: string; fg: string; border?: string }> = {
  surface: { bg: colors.surface1, fg: colors.text1, border: colors.border },
  overlay: { bg: colors.overlay, fg: colors.text1 },
  brand: { bg: colors.brand, fg: colors.onBrand },
  plain: { bg: 'transparent', fg: colors.text3 },
};

function IconButtonBase({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'surface',
  size = hitSize,
  iconSize = 20,
  filled,
  selected,
  badge,
  haptic = 'light',
  style,
}: IconButtonProps) {
  const v = variants[variant];
  return (
    <PressableScale
      onPress={onPress}
      haptic={haptic}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : { selected }}
      hitSlop={size < hitSize ? (hitSize - size) / 2 : undefined}
      style={[
        styles.base,
        { width: size, height: size, backgroundColor: v.bg },
        v.border ? { borderWidth: 1, borderColor: v.border } : null,
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} color={v.fg} filled={filled} />
      {badge ? <View style={[styles.badge, { borderColor: v.bg }]} /> : null}
    </PressableScale>
  );
}

export const IconButton = memo(IconButtonBase);

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.brand,
    borderWidth: 2,
  },
});
