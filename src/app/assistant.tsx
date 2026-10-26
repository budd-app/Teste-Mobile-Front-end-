import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';
import { reply } from '@/features/assistant/engine';
import { MessageBubble, type ChatMessage } from '@/features/assistant/MessageBubble';
import { TypingIndicator } from '@/features/assistant/TypingIndicator';
import { useNow } from '@/hooks/useNow';
import { api } from '@/services/api';
import { toast } from '@/store/toast';
import { colors, fonts, radius, spacing } from '@/theme/tokens';
import { greeting } from '@/utils/format';

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const STARTERS = ['Bar tranquilo com drink autoral, a pé', 'Onde dançar hoje?', 'Algo barato com samba'];
const THINK_MS = 900;

let seq = 0;
const nextId = () => `m${++seq}`;

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>(STARTERS);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: nextId(),
      role: 'assistant',
      text: `${greeting(new Date())}, Kauê! ${WEEKDAYS[new Date().getDay()]}, ${new Date().getHours()}h em Pinheiros. Me diz o clima e eu monto o rolê.`,
    },
  ]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || typing) return;
      setInput('');
      setFollowUps([]);
      setMessages((m) => [...m, { id: nextId(), role: 'user', text }]);
      setTyping(true);
      // "Pensando…": a resposta chega depois de um tempo curto, como numa conversa real.
      timer.current = setTimeout(() => {
        const r = reply(text, api.allBars());
        setTyping(false);
        setMessages((m) => [...m, { id: nextId(), role: 'assistant', text: r.text, suggestions: r.suggestions }]);
        setFollowUps(r.followUps);
      }, THINK_MS);
    },
    [typing],
  );

  const canSend = input.trim().length > 0 && !typing;
  const sendStyle = useAnimatedStyle(() => ({
    opacity: withTiming(canSend ? 1 : 0.4, { duration: 150 }),
    transform: [{ scale: withTiming(canSend ? 1 : 0.9, { duration: 150 }) }],
  }));

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <IconButton icon="chevronLeft" accessibilityLabel="Voltar" onPress={() => router.back()} iconSize={22} />
        <View style={styles.logo}>
          <Icon name="sparkle" size={22} color={colors.onBrand} filled strokeWidth={0} />
        </View>
        <View style={styles.flex}>
          <Text variant="h3" style={styles.title} accessibilityRole="header">
            budd AI
          </Text>
          <Text variant="small" color={colors.brand}>
            seu parceiro de rolê · {now.getHours()}h
          </Text>
        </View>
        <IconButton
          icon="plus"
          accessibilityLabel="Nova conversa"
          onPress={() => {
            setMessages((m) => m.slice(0, 1));
            setFollowUps(STARTERS);
          }}
        />
      </View>

      <ScrollView
        ref={scroll}
        style={styles.flex}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        accessibilityLiveRegion="polite"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {typing ? <TypingIndicator /> : null}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {followUps.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.followUps}
            keyboardShouldPersistTaps="handled"
          >
            {followUps.map((f) => (
              <PressableScale
                key={f}
                onPress={() => send(f)}
                haptic="selection"
                accessibilityLabel={`Sugestão: ${f}`}
                style={styles.followUp}
              >
                <Text variant="caption" color={colors.text2}>
                  {f}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>
        ) : null}
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Pergunte qualquer coisa…"
              placeholderTextColor={colors.text3}
              selectionColor={colors.brand}
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
              accessibilityLabel="Mensagem para o budd AI"
              maxFontSizeMultiplier={1.4}
              maxLength={300}
              style={styles.input}
            />
            <IconButton
              icon="mic"
              variant="plain"
              size={40}
              accessibilityLabel="Falar com o budd AI"
              onPress={() => toast('Comando de voz chega na próxima versão', 'info')}
            />
          </View>
          <Animated.View style={sendStyle}>
            <PressableScale
              onPress={() => send(input)}
              disabled={!canSend}
              haptic="light"
              accessibilityLabel="Enviar mensagem"
              style={styles.send}
            >
              <Icon name="send" size={22} color={colors.onBrand} strokeWidth={2.2} />
            </PressableScale>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1, minWidth: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.display, fontSize: 18 },
  messages: { padding: spacing.md, gap: 14 },
  composer: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, gap: 10 },
  followUps: { gap: spacing.xs },
  followUp: {
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  inputBox: {
    flex: 1,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 6,
  },
  input: { flex: 1, minWidth: 0, color: colors.text1, fontFamily: fonts.regular, fontSize: 15, paddingVertical: 0 },
  send: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
