import { StyleSheet, View } from 'react-native';

import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import { radius, spacing } from '@/theme/tokens';

/** Espelha o layout real das seções para não haver "pulo" quando o conteúdo chega. */
export function HomeSkeleton() {
  return (
    <SkeletonGroup>
      <View style={styles.wrap}>
        <Skeleton width={110} height={22} />
        <Skeleton height={380} radius={radius.xxl} />
        <View style={styles.row}>
          <Skeleton width={264} height={100} radius={radius.lg} />
          <Skeleton width={120} height={100} radius={radius.lg} />
        </View>
        <Skeleton width={180} height={22} />
        {[0, 1].map((i) => (
          <View key={i} style={styles.event}>
            <Skeleton width={56} height={60} radius={14} />
            <View style={styles.lines}>
              <Skeleton width="70%" height={14} />
              <Skeleton width="45%" height={12} />
            </View>
          </View>
        ))}
      </View>
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, overflow: 'hidden' },
  event: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  lines: { flex: 1, gap: spacing.xs },
});
