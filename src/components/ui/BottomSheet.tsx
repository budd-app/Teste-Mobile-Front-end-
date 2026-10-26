import { forwardRef, useCallback, useEffect, useImperativeHandle, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, motion, radius, spacing } from '@/theme/tokens';

export interface BottomSheetHandle {
  close: () => void;
}

interface Props {
  children: ReactNode;
  /** Chamado depois da animação de saída — normalmente `router.back`. */
  onClosed: () => void;
  accessibilityLabel: string;
  maxHeightRatio?: number;
}

/**
 * Bottom sheet próprio: entra com spring, fecha arrastando para baixo
 * (distância OU velocidade) ou tocando no fundo. Tudo na UI thread.
 */
export const BottomSheet = forwardRef<BottomSheetHandle, Props>(function BottomSheet(
  { children, onClosed, accessibilityLabel, maxHeightRatio = 0.85 },
  ref,
) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const offscreen = height;
  const y = useSharedValue(offscreen);

  useEffect(() => {
    y.set(withSpring(0, motion.spring));
  }, [y]);

  const close = useCallback(() => {
    y.set(
      withTiming(offscreen, { duration: 220 }, (done) => {
        if (done) scheduleOnRN(onClosed);
      }),
    );
  }, [offscreen, onClosed, y]);

  useImperativeHandle(ref, () => ({ close }), [close]);

  const pan = usePanGesture({
    activeOffsetY: 8,
    onUpdate: (e) => {
      y.set(Math.max(0, e.translationY));
    },
    onDeactivate: (e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        y.set(
          withTiming(offscreen, { duration: 200 }, (done) => {
            if (done) scheduleOnRN(onClosed);
          }),
        );
      } else {
        y.set(withSpring(0, motion.spring));
      }
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [0, offscreen], [1, 0], 'clamp') }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Fechar" accessibilityRole="button" />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel}
        style={[
          styles.sheet,
          { maxHeight: height * maxHeightRatio, paddingBottom: Math.max(insets.bottom, spacing.xl) },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={pan}>
          <View style={styles.handleArea} accessibilityHint="Arraste para baixo para fechar">
            <View style={styles.handle} />
          </View>
        </GestureDetector>
        {children}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  backdrop: { backgroundColor: colors.scrim },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface0,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
  },
  handleArea: { height: 28, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border },
});
