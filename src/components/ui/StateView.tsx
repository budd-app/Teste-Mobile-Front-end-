import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icons/Icon';
import { colors, radius, spacing } from '@/theme/tokens';

import { Button } from './Button';
import { Text } from './Text';

interface StateViewProps {
  kind: 'empty' | 'error';
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/**
 * Estado vazio / erro. Sempre explica o que houve e oferece uma saída —
 * nunca um beco sem saída. O erro entra com um "shake" curto.
 */
function StateViewBase({ kind, icon, title, message, actionLabel, onAction, secondaryLabel, onSecondary }: StateViewProps) {
  const shake = useSharedValue(0);
  useEffect(() => {
    if (kind !== 'error') return;
    shake.set(
      withSequence(
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      ),
    );
  }, [kind, shake]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const isError = kind === 'error';

  return (
    <Animated.View entering={FadeIn.duration(240)} style={styles.wrap} accessibilityRole={isError ? 'alert' : undefined}>
      <Animated.View style={shakeStyle}>
        {isError ? (
          <View style={[styles.iconBox, styles.errorBox]}>
            <Icon name={icon} size={40} color={colors.errorText} strokeWidth={1.8} />
          </View>
        ) : (
          <View style={styles.ring}>
            <View style={[styles.orbit, { top: 18, right: 24, width: 10, height: 10 }]} />
            <View style={[styles.orbit, { bottom: 26, left: 18, width: 8, height: 8 }]} />
            <View style={styles.iconBox}>
              <Icon name={icon} size={36} color={colors.brand} strokeWidth={1.8} />
            </View>
          </View>
        )}
      </Animated.View>
      <Text variant="h1" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" color={colors.text2} align="center" style={styles.message}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant={isError ? 'secondary' : 'primary'}
          icon={isError ? 'refresh' : undefined}
          style={styles.action}
        />
      ) : null}
      {secondaryLabel && onSecondary ? <Button label={secondaryLabel} onPress={onSecondary} variant="ghost" size="md" /> : null}
    </Animated.View>
  );
}

export const StateView = memo(StateViewBase);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl, gap: spacing.sm },
  ring: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: { position: 'absolute', borderRadius: 999, backgroundColor: colors.border },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: { width: 88, height: 88, backgroundColor: 'rgba(255,90,78,0.12)' },
  title: { marginTop: spacing.xs, fontSize: 24, lineHeight: 28 },
  message: { maxWidth: 290 },
  action: { marginTop: spacing.sm, alignSelf: 'stretch' },
});
