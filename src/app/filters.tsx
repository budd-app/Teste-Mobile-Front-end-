import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { BottomSheet, type BottomSheetHandle } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { bars } from '@/data/bars';
import { applyFilters, DEFAULT_FILTERS, VIBE_OPTIONS, type Filters } from '@/features/discovery/filtering';
import { useFilters } from '@/store/filters';
import { usePreferences } from '@/store/preferences';
import { colors, radius, spacing } from '@/theme/tokens';
import type { PriceLevel } from '@/types/domain';

const DISTANCES = [1, 2, 3, 5];
const PRICES: PriceLevel[] = [1, 2, 3, 4];

type Draft = Omit<Filters, 'quick'>;

/**
 * Edita um RASCUNHO local e só aplica no store ao confirmar: a Home não
 * refiltra a cada toque e "fechar sem aplicar" descarta as mudanças.
 */
export default function FiltersSheet() {
  const sheet = useRef<BottomSheetHandle>(null);
  const store = useFilters();
  const preferred = usePreferences((s) => s.vibes);
  const [draft, setDraft] = useState<Draft>({
    vibes: store.vibes,
    maxDistanceKm: store.maxDistanceKm,
    priceLevels: store.priceLevels,
    openNow: store.openNow,
    appOrders: store.appOrders,
  });

  // Prévia ao vivo do resultado no botão — o usuário sabe antes de aplicar.
  const count = useMemo(
    () => applyFilters(bars, { ...draft, quick: store.quick }, new Date(), { barsWithPromo: new Set(), preferred }).length,
    [draft, preferred, store.quick],
  );

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const apply = () => {
    store.apply(draft);
    sheet.current?.close();
  };

  return (
    <BottomSheet ref={sheet} onClosed={() => router.back()} accessibilityLabel="Filtros">
      <View style={styles.header}>
        <Text variant="h1" accessibilityRole="header">
          Filtros
        </Text>
        <PressableScale
          onPress={() => setDraft({ ...DEFAULT_FILTERS })}
          accessibilityLabel="Limpar filtros"
          hitSlop={8}
          style={styles.clear}
        >
          <Text variant="label" color={colors.text3}>
            Limpar
          </Text>
        </PressableScale>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <View style={styles.group}>
          <Text variant="overline" color={colors.text3}>
            Tipo de rolê
          </Text>
          <View style={styles.wrap}>
            {VIBE_OPTIONS.map((v) => (
              <Chip
                key={v.id}
                label={v.label}
                selected={draft.vibes.includes(v.id)}
                onPress={() => setDraft((d) => ({ ...d, vibes: toggle(d.vibes, v.id) }))}
              />
            ))}
          </View>
        </View>

        <View style={styles.group}>
          <View style={styles.rowBetween}>
            <Text variant="overline" color={colors.text3}>
              Distância
            </Text>
            <Text variant="label" color={colors.brand}>
              até {draft.maxDistanceKm} km
            </Text>
          </View>
          <Segmented
            options={DISTANCES.map((d) => ({ value: d, label: `${d} km` }))}
            value={draft.maxDistanceKm}
            onChange={(maxDistanceKm) => setDraft((d) => ({ ...d, maxDistanceKm }))}
            label="Distância máxima"
          />
        </View>

        <View style={styles.group}>
          <Text variant="overline" color={colors.text3}>
            Preço médio
          </Text>
          <View style={styles.grid}>
            {PRICES.map((p) => {
              const on = draft.priceLevels.includes(p);
              return (
                <PressableScale
                  key={p}
                  onPress={() => setDraft((d) => ({ ...d, priceLevels: toggle(d.priceLevels, p) }))}
                  haptic="selection"
                  accessibilityLabel={`Preço nível ${p} de 4`}
                  accessibilityState={{ selected: on }}
                  style={[styles.price, on && styles.priceOn]}
                >
                  <Text variant="bodyStrong" color={on ? colors.brand : colors.text1}>
                    {'$'.repeat(p)}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        <View>
          <ToggleRow label="Aberto agora" value={draft.openNow} onChange={(openNow) => setDraft((d) => ({ ...d, openNow }))} />
          <ToggleRow
            label="Aceita pedido pelo app"
            value={draft.appOrders}
            onChange={(appOrders) => setDraft((d) => ({ ...d, appOrders }))}
          />
        </View>
      </ScrollView>

      <Button
        label={count === 0 ? 'Nenhum lugar encontrado' : `Ver ${count} ${count === 1 ? 'lugar' : 'lugares'}`}
        onPress={apply}
        disabled={count === 0}
        haptic="success"
      />
    </BottomSheet>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggle}>
      <Text variant="body" style={styles.toggleLabel}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ false: colors.border, true: colors.brand }}
        thumbColor={value ? colors.bg : colors.text3}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

function Segmented<T extends number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <PressableScale
            key={o.value}
            onPress={() => onChange(o.value)}
            haptic="selection"
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={o.label}
            style={[styles.price, on && styles.priceOn]}
          >
            <Text variant="label" color={on ? colors.brand : colors.text1}>
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing.sm },
  clear: { minHeight: 44, justifyContent: 'center' },
  body: { gap: spacing.xl, paddingBottom: spacing.xl },
  group: { gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', gap: spacing.xs },
  price: {
    flex: 1,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceOn: { borderColor: colors.brand, borderWidth: 1.5, backgroundColor: 'rgba(118,235,60,0.12)' },
  toggle: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  toggleLabel: { flex: 1, fontFamily: 'Inter_500Medium' },
});
