import * as Haptics from 'expo-haptics';
import { memo, useCallback } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type HapticKind = 'none' | 'light' | 'medium' | 'selection' | 'success' | 'error';

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Escala no press-in. Padrão do DS: 0.96. */
  scaleTo?: number;
  haptic?: HapticKind;
}

export function triggerHaptic(kind: HapticKind) {
  switch (kind) {
    case 'light':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'medium':
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    case 'selection':
      return Haptics.selectionAsync();
    case 'success':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    case 'error':
      return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    default:
      return undefined;
  }
}

/**
 * Base de TODA superfície tocável do app: feedback de escala (UI thread,
 * via Reanimated) + haptic opcional. Garante "feedback visual em todas
 * as interações" sem repetir lógica em cada componente.
 */
function PressableScaleBase({
  style,
  scaleTo = motion.pressScale,
  haptic = 'none',
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  accessibilityRole = 'button',
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      scale.set(withTiming(scaleTo, { duration: motion.duration.press }));
      onPressIn?.(e);
    },
    [onPressIn, scale, scaleTo],
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      scale.set(withSpring(1, motion.spring));
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      triggerHaptic(haptic);
      onPress?.(e);
    },
    [haptic, onPress],
  );

  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: !!disabled, ...rest.accessibilityState }}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style, animatedStyle]}
    />
  );
}

export const PressableScale = memo(PressableScaleBase);
