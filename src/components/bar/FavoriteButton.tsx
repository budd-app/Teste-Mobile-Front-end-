import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/icons/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { selectIsFavorite, useFavorites } from '@/store/favorites';
import { toast } from '@/store/toast';
import { colors, hitSize, motion } from '@/theme/tokens';

interface Props {
  barId: string;
  barName: string;
  variant?: 'overlay' | 'surface';
}

/** Coração com "pop" elástico ao favoritar. Lê/escreve só a fatia do store que precisa. */
function FavoriteButtonBase({ barId, barName, variant = 'overlay' }: Props) {
  const isFav = useFavorites(selectIsFavorite(barId));
  const toggle = useFavorites((s) => s.toggle);
  const pop = useSharedValue(1);

  const onPress = useCallback(() => {
    const nowFav = toggle(barId);
    if (nowFav) {
      pop.set(withSequence(withTiming(1.35, { duration: 120 }), withSpring(1, motion.spring)));
      toast(`${barName} salvo nos favoritos`);
    } else {
      pop.set(withSequence(withTiming(0.8, { duration: 90 }), withSpring(1, motion.spring)));
    }
  }, [barId, barName, pop, toggle]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const bg = isFav ? colors.brand : variant === 'overlay' ? colors.overlay : colors.surface1;

  return (
    <PressableScale
      onPress={onPress}
      haptic={isFav ? 'light' : 'success'}
      accessibilityLabel={isFav ? `Remover ${barName} dos favoritos` : `Favoritar ${barName}`}
      accessibilityState={{ selected: isFav }}
      style={[styles.btn, { backgroundColor: bg }, variant === 'surface' && !isFav && styles.border]}
    >
      <Animated.View style={style}>
        <Icon name="heart" size={20} color={isFav ? colors.onBrand : colors.text1} filled={isFav} />
      </Animated.View>
    </PressableScale>
  );
}

export const FavoriteButton = memo(FavoriteButtonBase);

const styles = StyleSheet.create({
  btn: { width: hitSize, height: hitSize, borderRadius: hitSize / 2, alignItems: 'center', justifyContent: 'center' },
  border: { borderWidth: 1, borderColor: colors.border },
});
