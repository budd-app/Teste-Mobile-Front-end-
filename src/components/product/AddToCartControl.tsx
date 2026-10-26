import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ZoomIn } from 'react-native-reanimated';

import { Icon } from '@/components/icons/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { lineKey, selectQtyForProduct, useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import { colors, motion, radius } from '@/theme/tokens';
import type { Product } from '@/types/domain';

/**
 * Botão "+" que se transforma em seletor de quantidade (layout animation).
 * Produtos com opções abrem o detalhe em vez de adicionar direto.
 */
function AddToCartControlBase({ product, onNeedsOptions }: { product: Product; onNeedsOptions: () => void }) {
  const qty = useCart(selectQtyForProduct(product.id));
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const hasOptions = !!product.options?.length;

  const inc = useCallback(() => {
    if (hasOptions && qty === 0) return onNeedsOptions();
    const option = product.options?.[0];
    const { replaced } = add(product, 1, option);
    if (replaced) toast('Carrinho trocado para este bar', 'info');
    else if (qty === 0) toast(`${product.name} no pedido`);
  }, [add, hasOptions, onNeedsOptions, product, qty]);

  const dec = useCallback(() => {
    // Remove da linha padrão (ou da primeira opção) — detalhes ficam no checkout.
    const key = lineKey(product.id, product.options?.[0]?.id);
    const line =
      useCart.getState().lines.find((l) => l.key === key) ?? useCart.getState().lines.find((l) => l.productId === product.id);
    if (line) setQty(line.key, line.qty - 1);
  }, [product.id, product.options, setQty]);

  if (qty === 0) {
    return (
      <Animated.View entering={ZoomIn.duration(motion.duration.micro)} layout={LinearTransition.springify().damping(18)}>
        <PressableScale
          onPress={inc}
          haptic="light"
          accessibilityLabel={`Adicionar ${product.name} ao pedido`}
          hitSlop={4}
          style={styles.add}
        >
          <Icon name="plus" size={18} color={colors.brand} strokeWidth={2.4} />
        </PressableScale>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(motion.duration.micro)}
      exiting={FadeOut.duration(120)}
      layout={LinearTransition.springify().damping(18)}
      style={styles.stepper}
    >
      <PressableScale
        onPress={dec}
        haptic="selection"
        accessibilityLabel={`Remover um ${product.name}`}
        hitSlop={6}
        style={styles.stepBtn}
      >
        <Icon name="minus" size={16} color={colors.onBrand} strokeWidth={2.6} />
      </PressableScale>
      <View accessible accessibilityLabel={`${qty} no pedido`} accessibilityLiveRegion="polite">
        <Animated.View key={qty} entering={ZoomIn.duration(160)}>
          <Text variant="bodyStrong" color={colors.onBrand} style={styles.qty}>
            {qty}
          </Text>
        </Animated.View>
      </View>
      <PressableScale
        onPress={inc}
        haptic="selection"
        accessibilityLabel={`Adicionar mais um ${product.name}`}
        hitSlop={6}
        style={styles.stepBtn}
      >
        <Icon name="plus" size={16} color={colors.onBrand} strokeWidth={2.6} />
      </PressableScale>
    </Animated.View>
  );
}

export const AddToCartControl = memo(AddToCartControlBase);

const styles = StyleSheet.create({
  add: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { minWidth: 20, textAlign: 'center' },
});
