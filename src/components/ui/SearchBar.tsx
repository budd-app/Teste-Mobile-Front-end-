import { memo, useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/icons/Icon';
import { colors, fonts, motion, radius, spacing } from '@/theme/tokens';

import { IconButton } from './IconButton';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  onClear?: () => void;
  elevated?: boolean;
}

/** Campo de busca com anel de foco animado (borda + glow lime). */
function SearchBarBase({ value, onClear, elevated, onFocus, onBlur, accessibilityLabel = 'Buscar', ...rest }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const progress = useDerivedValue(() => withTiming(focused ? 1 : 0, { duration: motion.duration.micro }));

  const ring = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.brand]),
    shadowOpacity: progress.value * 0.35,
  }));

  return (
    <Animated.View style={[styles.box, elevated && styles.elevated, ring]}>
      <Icon name="search" size={20} color={focused ? colors.brand : colors.text3} />
      <TextInput
        value={value}
        placeholderTextColor={colors.text3}
        selectionColor={colors.brand}
        cursorColor={colors.brand}
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel}
        maxFontSizeMultiplier={1.4}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={styles.input}
        {...rest}
      />
      {value && onClear ? (
        <IconButton icon="close" accessibilityLabel="Limpar busca" variant="plain" size={32} iconSize={18} onPress={onClear} />
      ) : null}
    </Animated.View>
  );
}

export const SearchBar = memo(SearchBarBase);

const styles = StyleSheet.create({
  box: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    shadowColor: colors.brand,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  elevated: { backgroundColor: 'rgba(20,22,20,0.96)' },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.text1,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: 0,
  },
});
