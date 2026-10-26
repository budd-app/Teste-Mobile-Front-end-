import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale, triggerHaptic } from '@/components/ui/PressableScale';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { bars } from '@/data/bars';
import { computeTotals, COUPONS } from '@/features/checkout/pricing';
import { api } from '@/services/api';
import { useCart } from '@/store/cart';
import { useOrders } from '@/store/orders';
import { toast } from '@/store/toast';
import { colors, fonts, radius, spacing } from '@/theme/tokens';
import type { PaymentMethodId } from '@/types/domain';
import { formatBRL } from '@/utils/format';

const METHODS: { id: PaymentMethodId; label: string; hint: string; icon: IconName }[] = [
  { id: 'pix', label: 'Pix', hint: 'Aprovação na hora', icon: 'pix' },
  { id: 'card', label: 'Cartão •••• 4821', hint: 'Crédito · Mastercard', icon: 'card' },
  { id: 'wallet', label: 'Carteira budd', hint: 'Saldo R$ 25,00 + cashback', icon: 'wallet' },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const lines = useCart((s) => s.lines);
  const barId = useCart((s) => s.barId);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.add);

  const [method, setMethod] = useState<PaymentMethodId>('pix');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<string | undefined>();
  const [couponError, setCouponError] = useState(false);

  const totals = useMemo(() => computeTotals(lines, coupon), [lines, coupon]);
  const bar = bars.find((b) => b.id === barId);

  const pay = useMutation({
    mutationFn: () => api.createOrder({ barId: barId!, lines, method, coupon }),
    onSuccess: (order) => {
      triggerHaptic('success');
      addOrder(order);
      clear();
      router.replace({ pathname: '/order/[id]', params: { id: order.id } });
    },
    onError: () => {
      triggerHaptic('error');
      toast('Pagamento não concluído', 'error');
    },
  });

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setCoupon(code);
      setCouponError(false);
      toast(`Cupom ${code} aplicado`);
    } else {
      setCouponError(true);
    }
  };

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
      <IconButton icon="chevronLeft" accessibilityLabel="Voltar" onPress={() => router.back()} iconSize={22} />
      <View style={styles.flex}>
        <Text variant="h2" style={styles.heading} accessibilityRole="header">
          Seu pedido
        </Text>
        {bar ? (
          <Text variant="caption" color={colors.text3}>
            {bar.name}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (lines.length === 0) {
    return (
      <View style={styles.root}>
        {header}
        <View style={[styles.flex, styles.center]}>
          <StateView
            kind="empty"
            icon="cocktail"
            title="Copo vazio"
            message="Seu pedido está vazio. Que tal escolher um drink?"
            actionLabel="Explorar bares"
            onAction={() => router.navigate('/')}
          />
        </View>
      </View>
    );
  }

  const cta =
    method === 'pix'
      ? `Pagar ${formatBRL(totals.total)} com Pix`
      : method === 'wallet'
        ? 'Usar carteira budd'
        : `Pagar ${formatBRL(totals.total)}`;

  return (
    <View style={styles.root}>
      {header}
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View layout={LinearTransition.springify().damping(20)} style={styles.card}>
          {lines.map((l, i) => (
            <Animated.View
              key={l.key}
              entering={FadeIn}
              layout={LinearTransition}
              style={[styles.line, i > 0 && styles.lineBorder]}
            >
              <CategoryIcon category={l.category} size={36} />
              <View style={styles.flex}>
                <Text variant="body" numberOfLines={1}>
                  {l.name}
                </Text>
                {l.optionLabel ? (
                  <Text variant="small" color={colors.text3}>
                    {l.optionLabel}
                  </Text>
                ) : null}
                <Text variant="label" style={styles.linePrice}>
                  {formatBRL(l.unitPrice * l.qty)}
                </Text>
              </View>
              <View style={styles.stepper}>
                <PressableScale
                  onPress={() => setQty(l.key, l.qty - 1)}
                  haptic="selection"
                  accessibilityLabel={l.qty === 1 ? `Remover ${l.name}` : `Diminuir ${l.name}`}
                  hitSlop={5}
                  style={styles.stepBtn}
                >
                  <Icon name={l.qty === 1 ? 'close' : 'minus'} size={15} color={colors.text1} strokeWidth={2.4} />
                </PressableScale>
                <Animated.View key={l.qty} entering={ZoomIn.duration(150)}>
                  <Text variant="label" style={styles.qty}>
                    {l.qty}
                  </Text>
                </Animated.View>
                <PressableScale
                  onPress={() => setQty(l.key, l.qty + 1)}
                  haptic="selection"
                  accessibilityLabel={`Aumentar ${l.name}`}
                  hitSlop={5}
                  style={styles.stepBtn}
                >
                  <Icon name="plus" size={15} color={colors.text1} strokeWidth={2.4} />
                </PressableScale>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        <View style={styles.group}>
          <View style={[styles.coupon, coupon && styles.couponOk, couponError && styles.couponErr]}>
            <Icon name="tag" size={18} color={coupon ? colors.brand : colors.text3} />
            {coupon ? (
              <>
                <Text variant="bodyStrong" style={styles.flex}>
                  {coupon}
                </Text>
                <PressableScale
                  onPress={() => {
                    setCoupon(undefined);
                    setCouponInput('');
                  }}
                  accessibilityLabel={`Remover cupom ${coupon}`}
                  hitSlop={10}
                >
                  <Text variant="label" color={colors.text3}>
                    Remover
                  </Text>
                </PressableScale>
              </>
            ) : (
              <>
                <TextInput
                  value={couponInput}
                  onChangeText={(t) => {
                    setCouponInput(t);
                    setCouponError(false);
                  }}
                  placeholder="Cupom (tente BUDD10)"
                  placeholderTextColor={colors.text3}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={applyCoupon}
                  accessibilityLabel="Código do cupom"
                  maxFontSizeMultiplier={1.4}
                  style={styles.couponInput}
                />
                <PressableScale
                  onPress={applyCoupon}
                  disabled={!couponInput.trim()}
                  accessibilityLabel="Aplicar cupom"
                  hitSlop={10}
                >
                  <Text variant="label" color={couponInput.trim() ? colors.brand : colors.disabled}>
                    Aplicar
                  </Text>
                </PressableScale>
              </>
            )}
          </View>
          {couponError ? (
            <Animated.View entering={FadeInDown.duration(160)}>
              <Text variant="small" color={colors.errorText} accessibilityRole="alert">
                Cupom inválido ou expirado.
              </Text>
            </Animated.View>
          ) : null}
        </View>

        <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Forma de pagamento">
          <Text variant="overline" color={colors.text3}>
            Como você quer pagar?
          </Text>
          {METHODS.map((m) => {
            const on = m.id === method;
            return (
              <PressableScale
                key={m.id}
                onPress={() => setMethod(m.id)}
                haptic="selection"
                scaleTo={0.98}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${m.label}. ${m.hint}`}
                style={[styles.method, on && styles.methodOn]}
              >
                <View style={[styles.methodIcon, on && styles.methodIconOn]}>
                  <Icon name={m.icon} size={20} color={on ? colors.onBrand : colors.text1} />
                </View>
                <View style={styles.flex}>
                  <Text variant="bodyStrong">{m.label}</Text>
                  <Text variant="small" color={colors.text3}>
                    {m.hint}
                  </Text>
                </View>
                <View style={[styles.radio, on && styles.radioOn]}>
                  {on ? <Animated.View entering={ZoomIn.duration(140)} style={styles.radioDot} /> : null}
                </View>
              </PressableScale>
            );
          })}
        </View>

        <View style={styles.totals}>
          <Row label="Subtotal" value={formatBRL(totals.subtotal)} />
          {totals.discount ? <Row label={`Cupom ${coupon}`} value={`- ${formatBRL(totals.discount)}`} accent /> : null}
          <Row label="Taxa de serviço (10%)" value={formatBRL(totals.serviceFee)} />
          <View style={styles.totalRow}>
            <Text variant="h3">Total</Text>
            <Text variant="h3">{formatBRL(totals.total)}</Text>
          </View>
        </View>

        {pay.isError ? (
          <Animated.View entering={FadeInDown} style={styles.alert} accessibilityRole="alert">
            <View style={styles.alertIcon}>
              <Icon name="alert" size={16} color={colors.onBrand} strokeWidth={3} />
            </View>
            <View style={styles.flex}>
              <Text variant="bodyStrong">Pagamento não aprovado</Text>
              <Text variant="caption" color={colors.text2}>
                {pay.error.message}. Seu pedido continua salvo — tente de novo ou troque a forma de pagamento.
              </Text>
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button label={cta} icon="lock" onPress={() => pay.mutate()} loading={pay.isPending} haptic="medium" />
        <Text variant="small" color={colors.text3} align="center" style={styles.disclaimer}>
          Pagamento conceitual · nenhum dado real é processado
        </Text>
      </View>
    </View>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <Text variant="body" color={colors.text2}>
        {label}
      </Text>
      <Text variant="body" color={accent ? colors.brand : colors.text2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, minWidth: 0 },
  center: { justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  heading: { fontFamily: fonts.display },
  body: { padding: spacing.md, gap: spacing.lg, paddingBottom: 160 },
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.surface2,
    paddingHorizontal: spacing.md,
  },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  lineBorder: { borderTopWidth: 1, borderTopColor: colors.surface2 },
  linePrice: { marginTop: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface1,
    borderRadius: radius.pill,
    padding: 4,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { minWidth: 18, textAlign: 'center' },
  group: { gap: spacing.xs },
  coupon: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  couponOk: { borderColor: colors.brand },
  couponErr: { borderColor: colors.error },
  couponInput: { flex: 1, minWidth: 0, color: colors.text1, fontFamily: fonts.semibold, fontSize: 14, paddingVertical: 0 },
  method: {
    minHeight: 68,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingRight: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodOn: { borderColor: colors.brand, borderWidth: 1.5, backgroundColor: 'rgba(118,235,60,0.08)' },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconOn: { backgroundColor: colors.brand },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.brand },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },
  totals: { gap: spacing.xs, paddingHorizontal: spacing.xxs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    marginTop: spacing.xxs,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
  },
  alert: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: 'rgba(255,90,78,0.5)',
  },
  alertIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
    gap: spacing.xs,
  },
  disclaimer: { fontFamily: fonts.medium },
});
