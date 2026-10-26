import { createContext, memo, useContext, useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme/tokens';

/**
 * Um único relógio de shimmer por grupo: todos os blocos pulsam em
 * sincronia e só existe UMA animação rodando, não uma por bloco.
 */
const ShimmerContext = createContext<SharedValue<number> | null>(null);

export function SkeletonGroup({ children }: { children: ReactNode }) {
  const t = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    t.set(withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [reduced, t]);
  return (
    <ShimmerContext.Provider value={t}>
      <View accessible accessibilityLabel="Carregando conteúdo" accessibilityRole="progressbar">
        {children}
      </View>
    </ShimmerContext.Provider>
  );
}

interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

function SkeletonBase({ width = '100%', height, radius: r = radius.sm, style }: SkeletonProps) {
  const t = useContext(ShimmerContext);
  const animated = useAnimatedStyle(() => ({ opacity: t ? interpolate(t.value, [0, 1], [0.55, 1]) : 0.8 }));
  return <Animated.View style={[styles.block, { width, height, borderRadius: r }, animated, style]} />;
}

export const Skeleton = memo(SkeletonBase);

const styles = StyleSheet.create({
  block: { backgroundColor: colors.surface2 },
});
