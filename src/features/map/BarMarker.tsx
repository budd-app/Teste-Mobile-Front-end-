import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Icon } from '@/components/icons/Icon';
import { Text } from '@/components/ui/Text';
import { categories } from '@/theme/categories';
import { colors, radius } from '@/theme/tokens';
import type { Bar, CategoryId } from '@/types/domain';
import { formatRating } from '@/utils/format';

interface Props {
  bar: Bar;
  selected: boolean;
  hasEvent: boolean;
  onPress: (id: string) => void;
}

function categoryFor(bar: Bar): CategoryId {
  if (bar.vibes.includes('cocktail')) return 'cocktail';
  if (bar.vibes.includes('live') || bar.vibes.includes('jazz')) return 'event';
  return 'drink';
}

/**
 * Pin customizado. `tracksViewChanges` só fica ligado por um instante
 * após mudar de estado: manter ligado faz o mapa re-renderizar o marker
 * a cada frame — o maior vilão de performance em mapas com views custom.
 */
function BarMarkerBase({ bar, selected, hasEvent, onPress }: Props) {
  const [tracks, setTracks] = useState(true);
  const [lastSelected, setLastSelected] = useState(selected);
  // Estado derivado durante o render (padrão recomendado pelo React em vez de setState no effect).
  if (lastSelected !== selected) {
    setLastSelected(selected);
    setTracks(true);
  }
  useEffect(() => {
    if (!tracks) return;
    const t = setTimeout(() => setTracks(false), 400);
    return () => clearTimeout(t);
  }, [tracks]);

  const meta = categories[categoryFor(bar)];

  return (
    <Marker
      coordinate={bar.coords}
      onPress={() => onPress(bar.id)}
      tracksViewChanges={tracks}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={selected ? 10 : 1}
      accessibilityLabel={`${bar.name}, nota ${formatRating(bar.rating)}`}
    >
      {selected ? (
        <View style={[styles.pin, styles.selected]}>
          <View style={styles.initials}>
            <Text variant="small" color={colors.brand}>
              {bar.initials}
            </Text>
          </View>
          <Text variant="label" color={colors.onBrand} numberOfLines={1}>
            {bar.name}
          </Text>
        </View>
      ) : (
        <View style={[styles.pin, hasEvent && styles.event]}>
          <Icon name={meta.icon} size={14} color={meta.color} strokeWidth={2.2} />
          <Text variant="small" color={colors.text1}>
            {formatRating(bar.rating)}
          </Text>
        </View>
      )}
    </Marker>
  );
}

export const BarMarker = memo(BarMarkerBase);

const styles = StyleSheet.create({
  pin: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  event: { borderColor: '#A98BFF' },
  selected: { height: 44, paddingLeft: 6, paddingRight: 14, backgroundColor: colors.brand, borderColor: colors.brand, gap: 8 },
  initials: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.onBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
