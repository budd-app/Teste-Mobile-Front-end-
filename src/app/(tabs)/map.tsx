import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '@/components/navigation/FloatingTabBar';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { USER_LOCATION } from '@/data/bars';
import { daysFromNow, events } from '@/data/catalog';
import { searchBars } from '@/features/discovery/filtering';
import { BarMarker } from '@/features/map/BarMarker';
import { MapBarCard } from '@/features/map/MapBarCard';
import { darkMapStyle } from '@/features/map/mapStyle';
import { mapsAvailable } from '@/features/map/mapsAvailability';
import { useNow } from '@/hooks/useNow';
import { api } from '@/services/api';
import { colors, spacing } from '@/theme/tokens';
import type { Bar } from '@/types/domain';
import { isOpenAt } from '@/utils/format';

type MapFilter = 'open' | 'events' | 'promos' | 'drinks';

const MAP_FILTERS: { id: MapFilter; label: string }[] = [
  { id: 'open', label: 'Aberto agora' },
  { id: 'events', label: 'Eventos em breve' },
  { id: 'promos', label: 'Promoções' },
  { id: 'drinks', label: 'Drinks' },
];

const DELTA = { latitudeDelta: 0.018, longitudeDelta: 0.018 };
const CARD_GAP = spacing.sm;

export default function MapScreen() {
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const now = useNow();
  const map = useRef<MapView>(null);
  const list = useRef<FlatList<Bar>>(null);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState<MapFilter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(focus ?? null);
  const [lastFocus, setLastFocus] = useState(focus);
  if (focus !== lastFocus) {
    setLastFocus(focus);
    if (focus) setSelectedId(focus);
  }

  const barsWithEvent = useMemo(() => {
    const soon = daysFromNow(3);
    return new Set(events.filter((e) => e.date <= soon).map((e) => e.barId));
  }, []);
  const barsWithPromo = useMemo(() => new Set(api.allPromos().map((p) => p.barId)), []);

  const visible = useMemo(() => {
    let result = searchBars(api.allBars(), query);
    if (active.includes('open')) result = result.filter((b) => isOpenAt(b.hours, now));
    if (active.includes('events')) result = result.filter((b) => barsWithEvent.has(b.id));
    if (active.includes('promos')) result = result.filter((b) => barsWithPromo.has(b.id));
    if (active.includes('drinks')) result = result.filter((b) => b.vibes.includes('cocktail'));
    return [...result].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [active, barsWithEvent, barsWithPromo, now, query]);

  const cardWidth = width - spacing.md * 2;
  const selected = visible.find((b) => b.id === selectedId) ?? visible[0];

  const focusBar = useCallback((bar: Bar) => {
    map.current?.animateToRegion({ ...bar.coords, ...DELTA, latitude: bar.coords.latitude - 0.003 }, 350);
  }, []);

  // Chegou com ?focus=<bar> (botão "Rota"/"Ver no mapa"): centraliza nele.
  useEffect(() => {
    if (!focus) return;
    const bar = api.allBars().find((b) => b.id === focus);
    const index = visible.findIndex((b) => b.id === focus);
    if (bar) setTimeout(() => focusBar(bar), 300);
    if (index >= 0) setTimeout(() => list.current?.scrollToIndex({ index, animated: false }), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  const onMarkerPress = useCallback(
    (id: string) => {
      setSelectedId(id);
      const index = visible.findIndex((b) => b.id === id);
      if (index >= 0) list.current?.scrollToIndex({ index, animated: true });
      const bar = visible[index];
      if (bar) focusBar(bar);
    },
    [focusBar, visible],
  );

  // Arrastar o carrossel seleciona o bar e move o mapa — mapa e lista sempre em sincronia.
  // Callback estável (deps vazias): a FlatList não aceita trocar onViewableItemsChanged em tempo de execução.
  const onViewable = useCallback(({ viewableItems }: { viewableItems: { item: Bar }[] }) => {
    const first = viewableItems[0]?.item;
    if (first) {
      setSelectedId(first.id);
      map.current?.animateToRegion({ ...first.coords, ...DELTA, latitude: first.coords.latitude - 0.003 }, 350);
    }
  }, []);

  const toggle = (f: MapFilter) => setActive((a) => (a.includes(f) ? a.filter((x) => x !== f) : [...a, f]));
  const bottom = TAB_BAR_HEIGHT + Math.max(insets.bottom, spacing.md) + spacing.md;

  return (
    <View style={styles.root}>
      {mapsAvailable ? (
        <MapView
          ref={map}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          initialRegion={{ ...USER_LOCATION, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
          customMapStyle={darkMapStyle}
          userInterfaceStyle="dark"
          showsPointsOfInterests={false}
          toolbarEnabled={false}
          showsCompass={false}
          mapPadding={{ top: insets.top + 120, bottom: bottom + 170, left: 0, right: 0 }}
          accessibilityLabel="Mapa de bares próximos"
        >
          <Marker
            coordinate={USER_LOCATION}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            accessibilityLabel="Você está aqui"
          >
            <View style={styles.userHalo}>
              <View style={styles.userDot} />
            </View>
          </Marker>
          {visible.map((b) => (
            <BarMarker
              key={b.id}
              bar={b}
              selected={b.id === selected?.id}
              hasEvent={barsWithEvent.has(b.id)}
              onPress={onMarkerPress}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.noMap} accessibilityRole="alert">
          <Text variant="h3" align="center">
            Mapa indisponível nesta build
          </Text>
          <Text variant="caption" color={colors.text3} align="center">
            Configure GOOGLE_MAPS_API_KEY para ver o mapa. Os bares próximos continuam abaixo.
          </Text>
        </View>
      )}

      <View style={[styles.top, { paddingTop: insets.top + spacing.xs }]} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            placeholder="Buscar nesta área"
            elevated
            accessibilityLabel="Buscar bares no mapa"
          />
          <IconButton
            icon="list"
            accessibilityLabel="Ver em lista"
            size={52}
            iconSize={22}
            onPress={() => router.navigate('/')}
            style={styles.squareBtn}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {MAP_FILTERS.map((f) => (
            <Chip key={f.id} label={f.label} selected={active.includes(f.id)} onPress={() => toggle(f.id)} />
          ))}
        </ScrollView>
      </View>

      <View style={[styles.bottom, { bottom }]} pointerEvents="box-none">
        <IconButton
          icon="locate"
          accessibilityLabel="Centralizar na minha localização"
          size={48}
          onPress={() => map.current?.animateToRegion({ ...USER_LOCATION, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 400)}
          style={[styles.squareBtn, styles.locate]}
        />
        {visible.length ? (
          <FlatList
            ref={list}
            data={visible}
            keyExtractor={(b) => b.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={styles.cards}
            renderItem={({ item }) => <MapBarCard bar={item} width={cardWidth} now={now} />}
            getItemLayout={(_, index) => ({ length: cardWidth + CARD_GAP, offset: (cardWidth + CARD_GAP) * index, index })}
            onViewableItemsChanged={onViewable}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          />
        ) : (
          <View style={styles.emptyCard} accessibilityRole="alert">
            <Text variant="h3">Nada nesta área</Text>
            <Text variant="caption" color={colors.text3}>
              Tente tirar algum filtro ou buscar outro nome.
            </Text>
            <Button
              label="Limpar filtros"
              size="md"
              variant="secondary"
              onPress={() => {
                setActive([]);
                setQuery('');
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E100E' },
  noMap: { ...StyleSheet.absoluteFill, justifyContent: 'center', paddingHorizontal: spacing.xxl, gap: spacing.xs },
  top: { position: 'absolute', top: 0, left: 0, right: 0, gap: spacing.sm },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.md },
  squareBtn: { borderRadius: 16, backgroundColor: 'rgba(20,22,20,0.96)' },
  chips: { paddingHorizontal: spacing.md, gap: spacing.xs },
  bottom: { position: 'absolute', left: 0, right: 0, gap: spacing.sm },
  locate: { alignSelf: 'flex-end', marginRight: spacing.md },
  cards: { paddingHorizontal: spacing.md, gap: CARD_GAP },
  emptyCard: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    gap: spacing.xs,
    borderRadius: 28,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'android' ? { elevation: 8 } : null),
  },
  userHalo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(107,184,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(107,184,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.info, borderWidth: 3, borderColor: colors.text1 },
});
