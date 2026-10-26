import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons/Icon';
import { colors, palette } from '@/theme/tokens';
import { formatRating } from '@/utils/format';

import { Text } from './Text';

function RatingBase({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`Nota ${formatRating(value)} de 5`}>
      <Icon name="star" size={size} color={palette.amber} filled strokeWidth={0} />
      <Text variant="label" color={colors.text1}>
        {formatRating(value)}
      </Text>
    </View>
  );
}

export const Rating = memo(RatingBase);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
