import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/Icon';
import { useTabBarInset } from '@/components/navigation/FloatingTabBar';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Cover } from '@/components/ui/Cover';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { bars } from '@/data/bars';
import { rankBars } from '@/features/assistant/engine';
import { useFavorites } from '@/store/favorites';
import { useOrders } from '@/store/orders';
import { usePreferences } from '@/store/preferences';
import { toast } from '@/store/toast';
import { colors, fonts, motion, palette, radius, spacing } from '@/theme/tokens';
import type { Vibe } from '@/types/domain';
import { formatBRL } from '@/utils/format';

const PREFS: { id: Vibe; label: string }[] = [
  { id: 'jazz', label: 'Jazz' },
  { id: 'cocktail', label: 'Drinks autorais' },
  { id: 'outdoor', label: 'Ao ar livre' },
  { id: 'wine', label: 'Vinho' },
  { id: 'samba', label: 'Samba' },
  { id: 'craft', label: 'Cerveja artesanal' },
  { id: 'vegan', label: 'Vegano' },
  { id: 'balada', label: 'Balada' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarInset();
  const vibes = usePreferences((s) => s.vibes);
  const toggleVibe = usePreferences((s) => s.toggleVibe);
  const simulateOffline = usePreferences((s) => s.simulateOffline);
  const setSimulateOffline = usePreferences((s) => s.setSimulateOffline);
  const favIds = useFavorites((s) => s.ids);
  const orders = useOrders((s) => s.orders);

  const favorites = useMemo(() => bars.filter((b) => favIds.includes(b.id)), [favIds]);
  // Recomendações recalculadas ao vivo conforme o usuário ajusta as preferências.
  const recs = useMemo(
    () =>
      rankBars(
        bars.filter((b) => !favIds.includes(b.id)),
        { vibes },
      ).slice(0, 2),
    [favIds, vibes],
  );
  const cashback = 48 + orders.reduce((a, o) => a + o.cashback, 0);
  const prefLabels = PREFS.filter((p) => vibes.includes(p.id)).map((p) => p.label.toLowerCase());

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xs, paddingBottom: bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text variant="h2" style={styles.heading} accessibilityRole="header">
          Perfil
        </Text>
        <IconButton
          icon="settings"
          accessibilityLabel="Configurações"
          onPress={() => toast('Configurações chegam na próxima versão', 'info')}
        />
      </View>

      <Animated.View entering={FadeInDown.duration(motion.duration.enter)} style={styles.identity}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing} />
          <View style={styles.avatar} accessible accessibilityLabel="Foto de perfil de Kauê Victor">
            <Text style={styles.avatarText}>K</Text>
          </View>
          <PressableScale
            onPress={() => toast('Câmera disponível no app final', 'info')}
            accessibilityLabel="Trocar foto"
            style={styles.camera}
          >
            <Icon name="camera" size={16} color={colors.onBrand} strokeWidth={2.2} />
          </PressableScale>
        </View>
        <Text variant="h1" style={styles.name}>
          Kauê Victor
        </Text>
        <Badge label="Explorador · nível 3" tone="open" />
        <View style={styles.stats}>
          <Stat value="27" label="bares" />
          <Stat value={String(9 + orders.length)} label="pedidos" />
          <Stat value={formatBRL(cashback).replace(',00', '')} label="cashback" accent />
        </View>
      </Animated.View>

      <View style={styles.section}>
        <SectionHeader title="Seu estilo de rolê" subtitle="Toque para ajustar suas recomendações" />
        <View style={styles.chips}>
          {PREFS.map((p) => (
            <Chip key={p.id} label={p.label} tone="soft" selected={vibes.includes(p.id)} onPress={() => toggleVibe(p.id)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Bares favoritos" meta={`${favorites.length}`} />
        {favorites.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {favorites.map((b) => (
              <PressableScale
                key={b.id}
                onPress={() => router.push({ pathname: '/bar/[id]', params: { id: b.id } })}
                accessibilityLabel={b.name}
                style={styles.fav}
              >
                <Cover tone={b.tone} uri={b.image} icon="heart" iconSize={28} radius={radius.lg} style={styles.favCover}>
                  <View style={styles.favHeart}>
                    <Icon name="heart" size={14} color={colors.onBrand} filled />
                  </View>
                </Cover>
                <Text variant="label" numberOfLines={1}>
                  {b.name}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>
        ) : (
          <Text variant="body" color={colors.text3} style={styles.pad}>
            Toque no coração de um bar para salvá-lo aqui.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Feito pra você"
          subtitle={prefLabels.length ? `Porque você curte ${prefLabels.slice(0, 2).join(' e ')}` : 'Escolha seu estilo acima'}
        />
        <View style={styles.stack}>
          {recs.map(({ bar, match }) => (
            <PressableScale
              key={bar.id}
              onPress={() => router.push({ pathname: '/bar/[id]', params: { id: bar.id } })}
              scaleTo={0.98}
              accessibilityLabel={`${bar.name}, ${match}% de compatibilidade`}
              style={styles.rec}
            >
              <Cover tone={bar.tone} uri={bar.image} icon="sparkle" iconSize={22} radius={radius.md} style={styles.recCover} />
              <View style={styles.flex}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {bar.name}
                </Text>
                <Text variant="caption" color={colors.text3} numberOfLines={1}>
                  {bar.category}
                </Text>
              </View>
              <Badge label={`${match}%`} tone="brand" />
            </PressableScale>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.menu, styles.pad]}>
          <MenuRow icon="ticket" label="Pedidos e ingressos" onPress={() => router.navigate('/orders')} />
          <MenuRow
            icon="wallet"
            label="Pagamentos e carteira"
            onPress={() => toast('Carteira chega na próxima versão', 'info')}
          />
          <View style={[styles.menuRow, styles.menuBorder]}>
            <Icon name="wifiOff" size={20} color={colors.text1} />
            <View style={styles.flex}>
              <Text variant="body">Simular falha de rede</Text>
              <Text variant="small" color={colors.text3}>
                Demonstra os estados de erro
              </Text>
            </View>
            <Switch
              value={simulateOffline}
              onValueChange={setSimulateOffline}
              accessibilityLabel="Simular falha de rede"
              trackColor={{ false: colors.border, true: colors.error }}
              thumbColor={colors.text1}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={[styles.statValue, accent && { color: colors.brand }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text variant="small" color={colors.text3}>
        {label}
      </Text>
    </View>
  );
}

function MenuRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.99} accessibilityLabel={label} style={[styles.menuRow, styles.menuBorder]}>
      <Icon name={icon} size={20} color={colors.text1} />
      <Text variant="body" style={styles.flex}>
        {label}
      </Text>
      <Icon name="chevronRight" size={18} color={colors.text3} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, minWidth: 0 },
  pad: { marginHorizontal: spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.xl,
  },
  heading: { fontFamily: fonts.display },
  identity: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  avatarWrap: { width: 112, height: 112 },
  avatarRing: { ...StyleSheet.absoluteFill, borderRadius: 56, borderWidth: 3, borderColor: colors.brand },
  avatar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 48,
    backgroundColor: '#2A3D22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.display, fontSize: 40, color: palette.lime100 },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text1,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { marginTop: spacing.xxs },
  stats: { flexDirection: 'row', gap: spacing.xs, alignSelf: 'stretch', marginTop: spacing.xs },
  stat: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.text1 },
  section: { paddingTop: spacing.xxl, gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.xl },
  hList: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  fav: { width: 140, gap: spacing.xs },
  favCover: { height: 140 },
  favHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  rec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  recCover: { width: 64, height: 64 },
  menu: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
    overflow: 'hidden',
  },
  menuRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  menuBorder: { borderTopWidth: 1, borderTopColor: colors.surface2, marginTop: -1 },
});
