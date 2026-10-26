import { memo } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { categories } from '@/theme/categories';
import type { CategoryId } from '@/types/domain';

interface CategoryIconProps {
  category: CategoryId;
  size?: number;
  /** "tint" = fundo translúcido da categoria; "overlay" = fundo escuro sobre foto. */
  variant?: 'tint' | 'overlay';
}

function CategoryIconBase({ category, size = 32, variant = 'tint' }: CategoryIconProps) {
  const meta = categories[category];
  return (
    <View
      accessible
      accessibilityLabel={meta.label}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: variant === 'tint' ? meta.tint : 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={meta.icon} size={size * 0.56} color={meta.color} />
    </View>
  );
}

export const CategoryIcon = memo(CategoryIconBase);
