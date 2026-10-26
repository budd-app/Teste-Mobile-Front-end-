import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme/tokens';

function Dot({ i }: { i: number }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.set(withDelay(i * 140, withRepeat(withSequence(withTiming(-4, { duration: 260 }), withTiming(0, { duration: 260 })), -1)));
  }, [i, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], opacity: 0.4 + (-y.value / 4) * 0.6 }));
  return <Animated.View style={[styles.dot, style]} />;
}

function TypingIndicatorBase() {
  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.bubble}
      accessible
      accessibilityLabel="budd AI está digitando"
    >
      <View style={styles.row}>
        {[0, 1, 2].map((i) => (
          <Dot key={i} i={i} />
        ))}
      </View>
    </Animated.View>
  );
}

export const TypingIndicator = memo(TypingIndicatorBase);

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface1,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  row: { flexDirection: 'row', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand },
});
