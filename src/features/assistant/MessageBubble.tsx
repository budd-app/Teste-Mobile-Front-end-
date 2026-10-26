import { router } from 'expo-router';
import { memo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Badge } from '@/components/ui/Badge';
import { Cover } from '@/components/ui/Cover';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { toast } from '@/store/toast';
import { colors, radius, spacing } from '@/theme/tokens';
import { formatDistance, formatPriceLevel } from '@/utils/format';

import type { Suggestion } from './engine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions?: Suggestion[];
}

function MessageBubbleBase({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const top = message.suggestions?.[0];

  return (
    <Animated.View
      entering={(isUser ? FadeInUp : FadeInDown).springify().damping(18)}
      style={[styles.wrap, isUser ? styles.right : styles.left]}
    >
      <View
        style={[styles.bubble, isUser ? styles.user : styles.bot]}
        accessibilityLabel={`${isUser ? 'Você' : 'budd AI'}: ${message.text}`}
        accessible
      >
        <Text variant="body" color={isUser ? colors.onBrand : colors.text1} style={isUser && styles.userText}>
          {message.text}
        </Text>
      </View>

      {message.suggestions?.length ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cards}
            style={styles.cardsScroll}
          >
            {message.suggestions.map(({ bar, match }, i) => (
              <PressableScale
                key={bar.id}
                onPress={() => router.push({ pathname: '/bar/[id]', params: { id: bar.id } })}
                accessibilityLabel={`${bar.name}, ${match}% de compatibilidade, ${bar.walkMinutes} minutos a pé`}
                style={styles.card}
              >
                <Cover tone={bar.tone} uri={bar.image} icon="cocktail" iconSize={28} style={styles.cardCover}>
                  <Badge label={`${match}% match`} tone={i === 0 ? 'brand' : 'neutral'} style={styles.match} />
                </Cover>
                <View style={styles.cardInfo}>
                  <Text variant="label" numberOfLines={1}>
                    {bar.name}
                  </Text>
                  <Text variant="small" color={colors.text3} numberOfLines={1}>
                    {bar.walkMinutes} min a pé · {formatPriceLevel(bar.priceLevel)} · {formatDistance(bar.distanceKm)}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </ScrollView>
          {top ? (
            <View style={styles.actions}>
              <PressableScale
                onPress={() => toast(`Mesa reservada às 20h30 no ${top.bar.name}`)}
                haptic="success"
                accessibilityLabel={`Reservar 20h30 no ${top.bar.name}`}
                style={[styles.action, styles.actionPrimary]}
              >
                <Text variant="label" color={colors.brand}>
                  Reservar 20h30 no {top.bar.name.split(' ')[0]}
                </Text>
              </PressableScale>
              <PressableScale
                onPress={() => router.navigate({ pathname: '/map', params: { focus: top.bar.id } })}
                accessibilityLabel="Ver no mapa"
                style={styles.action}
              >
                <Text variant="label">Ver no mapa</Text>
              </PressableScale>
            </View>
          ) : null}
        </>
      ) : null}
    </Animated.View>
  );
}

export const MessageBubble = memo(MessageBubbleBase);

const styles = StyleSheet.create({
  wrap: { maxWidth: '92%', gap: 10 },
  left: { alignSelf: 'flex-start' },
  right: { alignSelf: 'flex-end', maxWidth: '84%' },
  bubble: { paddingHorizontal: 14, paddingVertical: spacing.sm },
  bot: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 6,
  },
  user: { backgroundColor: colors.brand, borderRadius: radius.lg, borderBottomRightRadius: 6 },
  userText: { fontFamily: 'Inter_500Medium' },
  cardsScroll: { marginHorizontal: -spacing.md, flexGrow: 0 },
  cards: { paddingHorizontal: spacing.md, gap: 10 },
  card: {
    width: 168,
    borderRadius: radius.lg,
    backgroundColor: colors.surface0,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardCover: { height: 88 },
  match: { position: 'absolute', top: 8, left: 8, height: 22 },
  cardInfo: { padding: 10, gap: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  action: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface1,
    justifyContent: 'center',
  },
  actionPrimary: { borderColor: colors.brand, borderWidth: 1.5, backgroundColor: 'transparent' },
});
