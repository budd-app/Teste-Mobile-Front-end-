import * as Haptics from 'expo-haptics';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { colors, fonts, motion } from '@/theme/tokens';

const AnimatedLine = Animated.createAnimatedComponent(Line);

/** Posições relativas (0–1) dos "pontos" — pessoas e lugares. */
const POINTS = [
  { x: 0.24, y: 0.25, brand: false, r: 3.5 },
  { x: 0.7, y: 0.19, brand: true, r: 4.5 },
  { x: 0.6, y: 0.39, brand: false, r: 3 },
  { x: 0.16, y: 0.56, brand: true, r: 4.5 },
  { x: 0.8, y: 0.62, brand: false, r: 3.5 },
  { x: 0.41, y: 0.74, brand: false, r: 4 },
  { x: 0.67, y: 0.82, brand: true, r: 3.5 },
  { x: 0.35, y: 0.35, brand: true, r: 2.5 },
];

// Linha do tempo (ms) — espelha o storyboard aprovado.
const T = { lines: 600, converge: 1200, brand: 1700, exit: 2500, exitDuration: 320 };
const LINE_LENGTH = 600;

interface Props {
  onFinish: () => void;
}

function Dot({
  index,
  p,
  width,
  height,
  converge,
}: {
  index: number;
  p: (typeof POINTS)[number];
  width: number;
  height: number;
  converge: SharedValue<number>;
}) {
  const appear = useSharedValue(0);
  useEffect(() => {
    appear.set(withDelay(60 + ((index * 137) % 480), withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) })));
  }, [appear, index]);

  const cx = width / 2;
  const cy = height / 2;
  const x = p.x * width;
  const y = p.y * height;
  const size = p.r * 2;

  const style = useAnimatedStyle(() => {
    // Na convergência os pontos são "puxados" até o centro e somem.
    const k = converge.value;
    return {
      opacity: appear.value * (1 - k),
      transform: [
        { translateX: x - size / 2 + (cx - x) * k },
        { translateY: y - size / 2 + (cy - y) * k },
        { scale: 0.4 + appear.value * 0.6 },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size, backgroundColor: p.brand ? colors.brand : colors.text1 },
        !p.brand && { opacity: 0.6 },
        style,
      ]}
    />
  );
}

function Connection({
  p,
  width,
  height,
  draw,
  converge,
}: {
  p: (typeof POINTS)[number];
  width: number;
  height: number;
  draw: SharedValue<number>;
  converge: SharedValue<number>;
}) {
  const cx = width / 2;
  const cy = height / 2;
  const x = p.x * width;
  const y = p.y * height;
  const props = useAnimatedProps(() => ({
    x1: x + (cx - x) * converge.value,
    y1: y + (cy - y) * converge.value,
    strokeDashoffset: LINE_LENGTH * (1 - draw.value),
    strokeOpacity: 0.7 * (1 - converge.value),
  }));
  return (
    <AnimatedLine
      x2={cx}
      y2={cy}
      stroke={colors.brand}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeDasharray={[LINE_LENGTH, LINE_LENGTH]}
      animatedProps={props}
    />
  );
}

function Ripple({ index, trigger }: { index: number; trigger: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, trigger.value * 1.4 - index * 0.2));
    return { opacity: (1 - t) * 0.5 * (t > 0 ? 1 : 0), transform: [{ scale: 1 + t * 4.5 }] };
  });
  return <Animated.View style={[styles.ripple, style]} />;
}

function AnimatedSplashBase({ onFinish }: Props) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const [wordWidth, setWordWidth] = useState(0);

  const draw = useSharedValue(0);
  const converge = useSharedValue(0);
  const center = useSharedValue(0);
  const ripples = useSharedValue(0);
  const brand = useSharedValue(reduced ? 1 : 0);
  const exit = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      exit.set(withDelay(700, withTiming(0, { duration: 150 })));
      const t = setTimeout(onFinish, 900);
      return () => clearTimeout(t);
    }
    draw.set(withDelay(T.lines, withTiming(1, { duration: 600, easing: Easing.inOut(Easing.cubic) })));
    converge.set(withDelay(T.converge, withTiming(1, { duration: 420, easing: Easing.in(Easing.cubic) })));
    center.set(withDelay(T.converge + 260, withSequence(withSpring(1.25, motion.spring), withSpring(1, motion.spring))));
    ripples.set(withDelay(T.converge + 320, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) })));
    brand.set(withDelay(T.brand, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })));
    exit.set(withDelay(T.exit, withTiming(0, { duration: T.exitDuration })));

    const haptic = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), T.converge + 300);
    const done = setTimeout(onFinish, T.exit + T.exitDuration);
    return () => {
      clearTimeout(haptic);
      clearTimeout(done);
    };
  }, [brand, center, converge, draw, exit, onFinish, reduced, ripples]);

  // O ponto central encolhe e desliza até virar o pingo do "budd".
  const dotTargetX = wordWidth / 2 + 2;
  const centerStyle = useAnimatedStyle(() => {
    const b = brand.value;
    return {
      opacity: reduced ? 0 : center.value > 0 ? 1 : 0,
      transform: [{ translateX: dotTargetX * b }, { translateY: -2 * b }, { scale: center.value * (1 - b * 0.714) }],
    };
  });

  const wordStyle = useAnimatedStyle(() => ({
    opacity: brand.value,
    transform: [{ translateY: (1 - brand.value) * 18 }],
  }));

  const containerStyle = useAnimatedStyle(() => ({ opacity: exit.value }));

  const onWordLayout = (e: LayoutChangeEvent) => setWordWidth(e.nativeEvent.layout.width);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, containerStyle]}
      accessible
      accessibilityLabel="budd. Bora sair hoje?"
      pointerEvents="none"
    >
      {!reduced ? (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            {POINTS.map((p, i) => (
              <Connection key={i} p={p} width={width} height={height} draw={draw} converge={converge} />
            ))}
          </Svg>
          {POINTS.map((p, i) => (
            <Dot key={i} index={i} p={p} width={width} height={height} converge={converge} />
          ))}
          <View style={styles.centerWrap}>
            {[0, 1, 2].map((i) => (
              <Ripple key={i} index={i} trigger={ripples} />
            ))}
            <Animated.View style={[styles.centerDot, centerStyle]} />
          </View>
        </>
      ) : null}

      <View style={styles.centerWrap}>
        <Animated.View style={[styles.wordmark, wordStyle]}>
          <View style={styles.wordRow}>
            <Text onLayout={onWordLayout} style={styles.word} allowFontScaling={false}>
              budd
            </Text>
            {/* Com movimento reduzido o pingo é estático; senão é o próprio ponto central. */}
            {reduced ? <View style={styles.staticDot} /> : <View style={styles.dotSpacer} />}
          </View>
          <Text variant="body" color={colors.text3}>
            bora sair hoje?
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

export const AnimatedSplash = memo(AnimatedSplashBase);

const styles = StyleSheet.create({
  root: { backgroundColor: colors.bg, zIndex: 100 },
  dot: { position: 'absolute', left: 0, top: 0 },
  centerWrap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  centerDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    shadowColor: colors.brand,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  ripple: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.brand,
  },
  wordmark: { alignItems: 'center', gap: 10, marginTop: 6 },
  wordRow: { flexDirection: 'row', alignItems: 'flex-end' },
  word: { fontFamily: fonts.display, fontSize: 72, lineHeight: 76, letterSpacing: -2.5, color: colors.text1 },
  dotSpacer: { width: 20 },
  staticDot: { width: 16, height: 16, borderRadius: 8, marginLeft: 4, marginBottom: 16, backgroundColor: colors.brand },
});
