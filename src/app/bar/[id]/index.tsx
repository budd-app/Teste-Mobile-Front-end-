import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventRow } from '@/components/bar/EventRow';
import { FavoriteButton } from '@/components/bar/FavoriteButton';
import { Icon, type IconName } from '@/components/icons/Icon';
import { CartBar } from '@/components/product/CartBar';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Cover } from '@/components/ui/Cover';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { HoursCard } from '@/features/bar/HoursCard';
import { useNow } from '@/hooks/useNow';
import { NotFoundError } from '@/services/api';
import { useBar } from '@/services/queries';
import { selectCount, useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import { colors, motion, palette, radius, spacing } from '@/theme/tokens';
import { formatCount, formatDistance, formatPriceLevel, formatRating } from '@/utils/format';

const COVER_H = 340;
const SLOTS = ['20h30', '21h', '22h'];

export default function BarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const { data, isPending, isError, error, refetch } = useBar(id);
  const cartCount = useCart(selectCount);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [reserving, setReserving] = useState(false);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  // Parallax: a capa rola mais devagar e amplia ao puxar para baixo.
  const coverStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-200, 0, COVER_H], [-100, 0, COVER_H * 0.45], 'clamp') },
      { scale: interpolate(scrollY.value, [-200, 0], [1.5, 1], 'clamp') },
    ],
  }));
  // Cabeçalho compacto aparece quando a capa sai da tela.
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [COVER_H - 160, COVER_H - 80], [0, 1], 'clamp'),
  }));

  if (isPending) return <BarSkeleton top={insets.top} />;

  if (isError || !data) {
    const notFound = error instanceof NotFoundError;
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <StateView
          kind="error"
          icon={notFound ? 'search' : 'wifiOff'}
          title={notFound ? 'Bar não encontrado' : 'Caiu o sinal'}
          message={notFound ? 'Esse lugar pode ter saído do budd.' : 'Não conseguimos carregar o bar agora.'}
          actionLabel={notFound ? 'Voltar' : 'Tentar de novo'}
          onAction={notFound ? () => router.back() : () => refetch()}
        />
      </View>
    );
  }

  const { bar, events, promos, popular } = data;

  const reserve = () => {
    setReserving(true);
    setTimeout(() => {
      setReserving(false);
      toast(`Mesa reservada às ${slot} no ${bar.name}`);
    }, 900);
  };

  const share = () => Share.share({ message: `Bora no ${bar.name}? ${bar.address}, ${bar.neighborhood}. Achei no budd.` });

  const actions: { icon: IconName; label: string; onPress: () => void; primary?: boolean }[] = [
    { icon: 'calendar', label: 'Reservar', onPress: reserve, primary: true },
    { icon: 'cocktail', label: 'Cardápio', onPress: () => router.push({ pathname: '/bar/[id]/menu', params: { id: bar.id } }) },
    { icon: 'route', label: 'Rota', onPress: () => router.navigate({ pathname: '/map', params: { focus: bar.id } }) },
    { icon: 'phone', label: 'Ligar', onPress: () => toast('Ligação disponível no app final', 'info') },
  ];

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.coverWrap, coverStyle]}>
        <Cover
          tone={bar.tone}
          uri={bar.image}
          icon="cocktail"
          iconSize={72}
          style={styles.cover}
          accessibilityLabel={`Foto de capa do ${bar.name}`}
        >
          <View style={styles.coverScrim} />
        </Cover>
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: COVER_H - 56, paddingBottom: 140 + (cartCount ? 80 : 0) }}
      >
        <View style={styles.body}>
          <Animated.View entering={FadeInDown.duration(motion.duration.enter)} style={styles.logo}>
            <Text variant="h1" color={colors.onBrand}>
              {bar.initials}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(40).duration(motion.duration.enter)} style={styles.titles}>
            <Text variant="overline" color={colors.brand}>
              {bar.category}
            </Text>
            <Text variant="display" accessibilityRole="header" style={styles.name}>
              {bar.name}
            </Text>
            <View style={styles.metaRow}>
              <Icon name="star" size={15} color={palette.amber} filled strokeWidth={0} />
              <Text variant="label">{formatRating(bar.rating)}</Text>
              <Text variant="caption" color={colors.text2}>
                ({formatCount(bar.reviews)}) · {formatPriceLevel(bar.priceLevel)} · {formatDistance(bar.distanceKm)}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(motion.duration.enter)} style={styles.actions}>
            {actions.map((a) => (
              <PressableScale
                key={a.label}
                onPress={a.onPress}
                haptic="light"
                accessibilityLabel={a.label}
                style={[styles.action, a.primary && styles.actionPrimary]}
              >
                <Icon name={a.icon} size={22} color={a.primary ? colors.onBrand : colors.text1} />
                <Text variant="small" color={a.primary ? colors.onBrand : colors.text1}>
                  {a.label}
                </Text>
              </PressableScale>
            ))}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(motion.duration.enter)}>
            <HoursCard bar={bar} now={now} />
          </Animated.View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Galeria" meta={`${bar.gallery.length} fotos`} />
          <View style={styles.gallery} accessibilityLabel={`Galeria com ${bar.gallery.length} fotos`}>
            <Cover tone={bar.gallery[0]} icon="camera" iconSize={28} radius={radius.lg} style={styles.galleryBig} />
            <View style={styles.galleryCol}>
              {bar.gallery.slice(1, 3).map((t, i) => (
                <Cover key={i} tone={t} icon="camera" iconSize={22} radius={radius.lg} style={styles.gallerySmall} />
              ))}
              {bar.gallery.length < 3 ? <View style={styles.gallerySmall} /> : null}
            </View>
          </View>
        </View>

        {popular.length ? (
          <View style={styles.section}>
            <SectionHeader
              title="Mais pedidos"
              actionLabel="Cardápio completo"
              onAction={() => router.push({ pathname: '/bar/[id]/menu', params: { id: bar.id } })}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {popular.map((p) => (
                <ProductCard key={p.id} product={p} variant="tile" />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {events.length || promos.length ? (
          <View style={styles.section}>
            <SectionHeader title="Eventos e promoções" />
            <View style={styles.stack}>
              {events.map((e) => (
                <EventRow key={e.id} event={e} meta={`${e.time}${e.lineup ? ` · ${e.lineup}` : ''}`} variant="accent" />
              ))}
              {promos.map((p) => (
                <View key={p.id} style={styles.promo}>
                  <View style={styles.promoBadge}>
                    <Text variant="h3" color={colors.onBrand} style={styles.promoBadgeText}>
                      {p.badge}
                    </Text>
                  </View>
                  <View style={styles.flex}>
                    <Text variant="bodyStrong">{p.title}</Text>
                    <Text variant="caption" color="#FFD08A">
                      {p.subtitle}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Bom saber" />
          <View style={styles.amenities}>
            {bar.amenities.map((a) => (
              <View key={a} style={styles.amenity}>
                <Text variant="caption">{a}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Cabeçalho flutuante: botões sempre visíveis; nome aparece ao rolar. */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, styles.topBarBg, headerStyle]} />
        <IconButton
          icon="chevronLeft"
          variant="overlay"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          iconSize={22}
        />
        <Animated.View style={[styles.topTitle, headerStyle]}>
          <Text variant="h3" numberOfLines={1}>
            {bar.name}
          </Text>
        </Animated.View>
        <View style={styles.topActions}>
          <IconButton icon="share" variant="overlay" accessibilityLabel={`Compartilhar ${bar.name}`} onPress={share} />
          <FavoriteButton barId={bar.id} barName={bar.name} />
        </View>
      </View>

      {cartCount ? (
        <CartBar />
      ) : (
        <View style={[styles.reserveBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.flex}>
            <Text variant="small" color={colors.text3}>
              Mesa pra 4 hoje
            </Text>
            <View style={styles.slots} accessibilityRole="radiogroup" accessibilityLabel="Horário da reserva">
              {SLOTS.map((s) => (
                <PressableScale
                  key={s}
                  onPress={() => setSlot(s)}
                  haptic="selection"
                  accessibilityRole="radio"
                  accessibilityState={{ checked: slot === s }}
                  accessibilityLabel={s}
                  hitSlop={6}
                  style={[styles.slot, slot === s && styles.slotOn]}
                >
                  <Text variant="label" color={slot === s ? colors.brand : colors.text2}>
                    {s}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </View>
          <Button label="Reservar" onPress={reserve} loading={reserving} haptic="success" style={styles.reserveBtn} />
        </View>
      )}
    </View>
  );
}

function BarSkeleton({ top }: { top: number }) {
  return (
    <View style={styles.root}>
      <SkeletonGroup>
        <Skeleton height={COVER_H} radius={0} />
        <View style={[styles.body, { marginTop: -56, gap: spacing.md }]}>
          <Skeleton width={84} height={84} radius={26} />
          <Skeleton width={140} height={14} />
          <Skeleton width={240} height={34} />
          <View style={styles.actions}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} width="23%" height={72} radius={radius.lg} />
            ))}
          </View>
          <Skeleton height={130} radius={radius.lg} />
        </View>
      </SkeletonGroup>
      <View style={[styles.topBar, { paddingTop: top + spacing.xs }]}>
        <IconButton
          icon="chevronLeft"
          variant="overlay"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          iconSize={22}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center' },
  flex: { flex: 1, minWidth: 0 },
  coverWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: COVER_H },
  cover: { flex: 1 },
  coverScrim: {
    ...StyleSheet.absoluteFill,
    backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, #000 100%)',
  },
  body: { paddingHorizontal: spacing.xl, gap: 14 },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: colors.text1,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { gap: 6 },
  name: { fontSize: 34, lineHeight: 38 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', gap: spacing.xs, marginTop: 4 },
  action: {
    flex: 1,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPrimary: { backgroundColor: colors.brand, borderColor: colors.brand },
  section: { paddingTop: spacing.xxl, gap: spacing.sm },
  gallery: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.xl, height: 226 },
  galleryBig: { flex: 1 },
  galleryCol: { flex: 1, gap: 6 },
  gallerySmall: { flex: 1 },
  hList: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  stack: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#2A2010',
    borderWidth: 1,
    borderColor: '#4A3818',
  },
  promoBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: palette.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBadgeText: { fontFamily: 'BricolageGrotesque_800ExtraBold' },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.xl },
  amenity: {
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.surface2,
    justifyContent: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  topBarBg: { backgroundColor: 'rgba(0,0,0,0.92)', borderBottomWidth: 1, borderBottomColor: colors.surface2 },
  topTitle: { flex: 1, minWidth: 0 },
  topActions: { flexDirection: 'row', gap: spacing.xs, marginLeft: 'auto' },
  reserveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slots: { flexDirection: 'row', gap: 6, marginTop: 4 },
  slot: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  slotOn: { borderColor: colors.brand, backgroundColor: 'rgba(118,235,60,0.1)' },
  reserveBtn: { paddingHorizontal: spacing.xl },
});
