import { memo } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/theme/tokens';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Texto tipado pelo design system. Mantém o escalonamento de fonte do
 * sistema (acessibilidade), mas limita a 1.4x para não quebrar layouts.
 */
function TextBase({ variant = 'body', color = colors.text1, align, style, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[typography[variant], { color }, align && { textAlign: align }, style]}
    />
  );
}

export const Text = memo(TextBase);
