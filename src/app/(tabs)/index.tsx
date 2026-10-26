import { router } from 'expo-router';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarCard } from '@/components/bar/BarCard';
import { EventRow } from '@/components/bar/EventRow';
import { useTabBarInset } from '@/components/navigation/FloatingTabBar';
import { Chip } from '@/components/ui/Chip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { applyFilters, countAdvanced, QUICK_FILTERS, searchBars } from '@/features/discovery/filtering';
import { HighlightCarousel } from '@/features/home/HighlightCarousel';
import { HomeHeader } from '@/features/home/HomeHeader';
import { HomeSkeleton } from '@/features/home/HomeSkeleton';
import { PromoCard } from '@/features/home/PromoCard';
import { useNow } from '@/hooks/useNow';
import { useHomeFeed } from '@/services/queries';
import { useFilters } from '@/store/filters';
import { usePreferences } from '@/store/preferences';
import { colors, motion, spacing } from '@/theme/tokens';
import type { Bar } from '@/types/domain';
import { formatDistance, greeting } from '@/utils/format';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = useTabBarInset();
  const now = useNow();
  const { data, isPending, isError, refetch, isRefetching } = useHomeFeed();

  const [query, setQuery] = useState('');
  // Busca não trava a digitação: a filtragem roda com prioridade baixa.
  const deferredQuery = useDeferredValue(query);
  const filters = useFilters();
  const preferred = usePreferences((s) => s.vibes);
  const activeAdvanced = countAdvanced(filters);

  const feed = useMemo(() => {
    if (!data) return [];
    const ctx = { barsWithPromo: new Set(data.promos.map((p) => p.barId)), preferred };
    return searchBars(applyFilters(data.bars, filters, now, ctx), deferredQuery);
  }, [data, filters, now, preferred, deferredQuery]);

  const searching = deferredQuery.trim().length > 0;

  const renderBar = useCallback<ListRenderItem<Bar>>(
    ({ item, index }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * motion.stagger).duration(motion.duration.enter)}>
        <BarCard bar={item} now={now} />
      </Animated.View>
    ),
    [now],
  );

  const header = (
    <View style={{ paddingTop: insets.top + spacing.xs }}>
      <HomeHeader greeting={greeting(now)} query={query} onQueryChange={setQuery} activeFilters={activeAdvanced} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {QUICK_FILTERS.map((q) => (
          <Chip key={q.id} label={q.label} selected={filters.quick === q.id} onPress={() => filters.setQuick(q.id)} />
        ))}
      </ScrollView>

      {isPending ? <HomeSkeleton /> : null}

      {data && !searching ? (
        <>
          <View style={styles.section}>
            <SectionHeader title="Destaques" meta={`${data.highlights.length} escolhas`} />
            <View style={styles.sectionBody}>
              <HighlightCarousel bars={data.highlights} />
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Promoções agora" actionLabel="Ver todas" onAction={() => filters.setQuick('happy')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.hList, styles.sectionBody]}
            >
              {data.promos.map((p) => (
                <PromoCard key={p.id} promo={p} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Eventos perto de você" />
            <View style={[styles.events, styles.sectionBody]}>
              {data.events.slice(0, 3).map((e) => (
                <EventRow key={e.id} event={e} meta={`${e.barName} · ${e.time} · ${formatDistance(e.distanceKm)}`} />
              ))}
            </View>
          </View>
        </>
      ) : null}

      {data ? (
        <View style={[styles.section, styles.feedHeader]}>
          <SectionHeader
            title={searching ? 'Resultados' : 'Bares para você'}
            meta={`${feed.length} ${feed.length === 1 ? 'lugar' : 'lugares'}`}
          />
        </View>
      ) : null}
    </View>
  );

  const empty = isError ? (
    <StateView
      kind="error"
      icon="wifiOff"
      title="Caiu o sinal"
      message="Não conseguimos carregar os bares. Confira sua conexão e tente de novo."
      actionLabel="Tentar de novo"
      onAction={() => refetch()}
    />
  ) : data ? (
    <StateView
      kind="empty"
      icon="search"
      title="Silêncio por aqui…"
      message={
        searching
          ? `Nada encontrado para "${deferredQuery}". Que tal pedir uma sugestão ao budd AI?`
          : 'Nenhum lugar com esses filtros. Tente ampliar a distância.'
      }
      actionLabel={searching ? 'Pedir ao budd AI' : 'Limpar filtros'}
      onAction={searching ? () => router.push('/assistant') : filters.reset}
    />
  ) : undefined;

  return (
    <FlatList
      data={feed}
      keyExtractor={(b) => b.id}
      renderItem={renderBar}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={{ paddingBottom: bottomInset }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      initialNumToRender={4}
      windowSize={7}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          tintColor={colors.brand}
          colors={[colors.onBrand]}
          progressBackgroundColor={colors.brand}
          progressViewOffset={insets.top}
        />
      }
      style={styles.root}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  chips: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.xs },
  section: { paddingTop: spacing.xxl },
  sectionBody: { paddingTop: 14 },
  feedHeader: { paddingBottom: 14 },
  hList: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  events: { paddingHorizontal: spacing.xl, gap: 10 },
  separator: { height: spacing.xl },
});
