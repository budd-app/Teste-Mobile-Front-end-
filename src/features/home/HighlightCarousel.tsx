import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { Icon } from '@/components/icons/Icon';
import { Cover } from '@/components/ui/Cover';
import { PressableScale } from '@/components/ui/PressableScale';
import { Rating } from '@/components/ui/Rating';
import { Text } from '@/components/ui/Text';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Bar } from '@/types/domain';
import { formatDistance } from '@/utils/format';

const GAP = spacing.sm;

function Slide({ bar, width, index, scrollX }: { bar: Bar; width: number; index: number; scrollX: SharedValue<number> }) {
  const open = useCallback(() => router.push({ pathname: '/bar/[id]', params: { id: bar.id } }), [bar.id]);

  // Card ativo em escala cheia; vizinhos levemente menores — sensação de profundidade.
  const style = useAnimatedStyle(() => {
    const pos = scrollX.value / (width + GAP);
    const d = Math.abs(pos - index);
    return {
      transform: [{ scale: interpolate(d, [0, 1], [1, 0.94], 'clamp') }],
      opacity: interpolate(d, [0, 1], [1, 0.6], 'clamp'),
    };
  });

  return (
    <Animated.View style={[{ width }, style]}>
      <PressableScale onPress={open} scaleTo={0.98} accessibilityLabel={`Destaque: ${bar.name}. ${bar.tagline}`}>
        <Cover tone={bar.tone} uri={bar.image} icon="sparkle" iconSize={64} radius={radius.xxl} style={styles.cover}>
          {bar.featured ? (
            <View style={styles.featured}>
              <Icon name="sparkle" size={14} color={colors.onBrand} filled strokeWidth={0} />
              <Text variant="small" color={colors.onBrand}>
                {bar.featured.label}
              </Text>
            </View>
          ) : null}
          <View style={styles.scrim}>
            <Text variant="overline" color={colors.brand} numberOfLines={1}>
              {bar.tagline}
            </Text>
            <Text variant="h1" numberOfLines={1} style={styles.name}>
              {bar.name}
            </Text>
            <View style={styles.meta}>
              <Rating value={bar.rating} />
              <Text variant="caption" color={colors.text2} numberOfLines={1} style={styles.metaText}>
                {bar.category.split(' · ')[0]} · {formatDistance(bar.distanceKm)}
              </Text>
            </View>
          </View>
        </Cover>
      </PressableScale>
    </Animated.View>
  );
}

function PageDot({ index, scrollX, step }: { index: number; scrollX: SharedValue<number>; step: number }) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(scrollX.value / step - index);
    const t = interpolate(d, [0, 1], [1, 0], 'clamp');
    return { width: 6 + t * 14, backgroundColor: t > 0.5 ? colors.brand : colors.border };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

function HighlightCarouselBase({ bars }: { bars: Bar[] }) {
  const { width: screen } = useWindowDimensions();
  const width = Math.min(screen - spacing.xl * 2 - 30, 340);
  const step = width + GAP;
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.set(e.contentOffset.x);
  });

  return (
    <View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.track}
        accessibilityRole="adjustable"
        accessibilityLabel="Destaques"
      >
        {bars.map((b, i) => (
          <Slide key={b.id} bar={b} width={width} index={i} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>
      <View style={styles.dots} importantForAccessibility="no-hide-descendants">
        {bars.map((b, i) => (
          <PageDot key={b.id} index={i} scrollX={scrollX} step={step} />
        ))}
      </View>
    </View>
  );
}

export const HighlightCarousel = memo(HighlightCarouselBase);

const styles = StyleSheet.create({
  track: { paddingHorizontal: spacing.xl, gap: GAP },
  cover: { height: 380 },
  featured: {
    position: 'absolute',
    top: 14,
    right: 14,
    height: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: 72,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
    backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 65%)',
  },
  name: { fontSize: 30, lineHeight: 34 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaText: { flexShrink: 1 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingTop: spacing.md },
  dot: { height: 6, borderRadius: 3 },
});
