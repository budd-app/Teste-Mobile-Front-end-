import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { useToast } from '@/store/toast';
import { colors, radius, shadow, spacing } from '@/theme/tokens';

import { Text } from './Text';

const TONE = {
  success: { bg: colors.brand, icon: 'check' as const, border: colors.border },
  error: { bg: colors.error, icon: 'alert' as const, border: 'rgba(255,90,78,0.5)' },
  info: { bg: colors.info, icon: 'sparkle' as const, border: colors.border },
};

/** Feedback global de ações (sucesso/erro). Some sozinho e é anunciado ao leitor de tela. */
export function ToastHost() {
  const current = useToast((s) => s.current);
  const hide = useToast((s) => s.hide);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!current) return;
    AccessibilityInfo.announceForAccessibility(current.message);
    const t = setTimeout(hide, 2600);
    return () => clearTimeout(t);
  }, [current, hide]);

  if (!current) return null;
  const tone = TONE[current.tone];

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + spacing.xs }]}>
      <Animated.View
        key={current.id}
        entering={FadeInUp.springify().damping(18)}
        exiting={FadeOutUp.duration(180)}
        style={[styles.toast, { borderColor: tone.border }]}
        accessibilityRole="alert"
      >
        <View style={[styles.icon, { backgroundColor: tone.bg }]}>
          <Icon name={tone.icon} size={14} color={colors.onBrand} strokeWidth={3} />
        </View>
        <Text variant="bodyStrong" style={styles.text}>
          {current.message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.md, right: spacing.md, alignItems: 'center', zIndex: 50 },
  toast: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...shadow.floating,
  },
  icon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flexShrink: 1, fontSize: 14 },
});
