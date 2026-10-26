import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { SearchBar } from '@/components/ui/SearchBar';
import { Text } from '@/components/ui/Text';
import { toast } from '@/store/toast';
import { colors, palette, radius, spacing } from '@/theme/tokens';

interface Props {
  greeting: string;
  query: string;
  onQueryChange: (q: string) => void;
  activeFilters: number;
}

function HomeHeaderBase({ greeting, query, onQueryChange, activeFilters }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <PressableScale
          onPress={() => toast('Troca de bairro chega na próxima versão', 'info')}
          accessibilityLabel="Localização atual: Pinheiros, São Paulo. Toque para trocar"
          style={styles.location}
        >
          <Text variant="small" color={colors.text3} style={styles.locLabel}>
            Você está em
          </Text>
          <View style={styles.locRow}>
            <Icon name="pin" size={16} color={colors.brand} strokeWidth={2.2} />
            <Text variant="bodyStrong">Pinheiros, SP</Text>
            <Icon name="chevronDown" size={16} color={colors.text1} />
          </View>
        </PressableScale>
        <View style={styles.actions}>
          <IconButton
            icon="bell"
            accessibilityLabel="Notificações, 1 nova"
            badge
            onPress={() => toast('Sem notificações novas', 'info')}
          />
          <PressableScale onPress={() => router.navigate('/profile')} accessibilityLabel="Meu perfil" style={styles.avatar}>
            <Text variant="bodyStrong" color={palette.lime100}>
              K
            </Text>
          </PressableScale>
        </View>
      </View>

      <Text variant="display" accessibilityRole="header">
        {greeting}, Kauê.{'\n'}
        <Text variant="display" color={colors.text3}>
          O que rola hoje?
        </Text>
      </Text>

      <View style={styles.searchRow}>
        <SearchBar
          value={query}
          onChangeText={onQueryChange}
          onClear={() => onQueryChange('')}
          placeholder="Bares, drinks, eventos…"
        />
        <PressableScale
          onPress={() => router.push('/filters')}
          haptic="light"
          accessibilityLabel={activeFilters ? `Filtros, ${activeFilters} ativos` : 'Filtros'}
          style={styles.filterBtn}
        >
          <Icon name="sliders" size={22} color={colors.onBrand} strokeWidth={2.2} />
          {activeFilters > 0 ? (
            <View style={styles.count}>
              <Text variant="small" color={colors.onBrand} style={styles.countText}>
                {activeFilters}
              </Text>
            </View>
          ) : null}
        </PressableScale>
      </View>
    </View>
  );
}

export const HomeHeader = memo(HomeHeaderBase);

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  location: { minHeight: 44, justifyContent: 'center', gap: 2 },
  locLabel: { fontFamily: 'Inter_500Medium' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A3D22',
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: { flexDirection: 'row', gap: 10 },
  filterBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.text1,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontSize: 11, lineHeight: 13 },
});
