import { Image } from 'expo-image';
import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icons/Icon';

interface CoverProps {
  tone: string;
  uri?: string;
  icon?: IconName;
  iconSize?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  accessibilityLabel?: string;
}

/**
 * Imagem com fallback tonal. Sem foto (ou enquanto carrega), mostra a cor
 * de identidade do item + ícone da categoria — nunca um retângulo cinza.
 * expo-image cuida de cache em disco/memória e transição suave.
 */
function CoverBase({ tone, uri, icon, iconSize = 40, radius = 0, style, children, accessibilityLabel }: CoverProps) {
  return (
    <View
      style={[styles.box, { backgroundColor: tone, borderRadius: radius }, style]}
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      {icon && !uri ? (
        <View style={styles.center} pointerEvents="none">
          <Icon name={icon} size={iconSize} color="rgba(244,246,242,0.18)" strokeWidth={1.6} />
        </View>
      ) : null}
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} cachePolicy="memory-disk" />
      ) : null}
      {children}
    </View>
  );
}

export const Cover = memo(CoverBase);

const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
