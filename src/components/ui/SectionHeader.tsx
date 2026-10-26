import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme/tokens';

import { PressableScale } from './PressableScale';
import { Text } from './Text';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  meta?: string;
}

function SectionHeaderBase({ title, subtitle, actionLabel, onAction, meta }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        <Text variant="h2" accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color={colors.text3}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} hitSlop={12} accessibilityLabel={`${actionLabel}: ${title}`}>
          <Text variant="label" color={colors.brand}>
            {actionLabel}
          </Text>
        </PressableScale>
      ) : meta ? (
        <Text variant="caption" color={colors.text3}>
          {meta}
        </Text>
      ) : null}
    </View>
  );
}

export const SectionHeader = memo(SectionHeaderBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  titles: { flex: 1, minWidth: 0, gap: 2 },
});
