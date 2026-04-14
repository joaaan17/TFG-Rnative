import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';

import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import { createIApreguntasStyles } from './IApreguntas.styles';
import { useIApreguntasViewModel } from '../state/useIApreguntasViewModel';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ConsultorioComposer } from '../components/ConsultorioComposer';
import { LoadingMessagesOverlay } from '../components/LoadingMessagesOverlay';
import { ConsultorioXpRewardModal } from '../components/ConsultorioXpRewardModal';

export function IApreguntasScreen() {
  const palette = usePalette();
  const styles = useMemo(() => createIApreguntasStyles(palette), [palette]);
  const flatListRef = useRef<FlatList>(null);
  const {
    typewriterKey,
    questionText,
    setQuestionText,
    welcomeText,
    loading,
    messages,
    error,
    ask,
    lastAwardedXp,
    dismissXpReward,
    consultorioRemainingToday,
    nombreUsuario,
  } = useIApreguntasViewModel();

  useEffect(() => {
    if (messages.length > 0 || loading) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, loading]);

  const containerBg = palette.mainBackground ?? palette.background;
  const [sendHovered, setSendHovered] = useState(false);
  const webHoverHandlers =
    Platform.OS === 'web'
      ? {
          onMouseEnter: () => setSendHovered(true),
          onMouseLeave: () => setSendHovered(false),
        }
      : {};

  const atDailyLimit = consultorioRemainingToday === 0;
  const canSend =
    questionText.trim().length > 0 &&
    !loading &&
    !atDailyLimit;
  const isSendActive = canSend;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: containerBg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerAccent} />
        <Text
          style={[
            Hierarchy.titleSection,
            styles.sectionTitle,
            { color: palette.icon ?? palette.text },
          ]}
        >
          Consultorio
        </Text>
      </View>

      <View style={styles.welcomeArea}>
        <Text style={[Hierarchy.titleModalLarge, styles.helloText]}>
          Hola {nombreUsuario}
        </Text>
        <TypewriterTextComponent
          key={`welcome-${typewriterKey}`}
          text={welcomeText}
          speed={30}
          useDefaultFontFamily={false}
          className="border-0 pb-0"
          style={[Hierarchy.bodySmall, styles.welcomeText]}
        />
      </View>

      <View style={styles.chatAreaWrapper}>
        <FlatList
          ref={flatListRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessageBubble message={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={null}
          ListFooterComponent={
            loading ? <LoadingMessagesOverlay visible inline /> : null
          }
        />
      </View>

      {error ? (
        <Text style={[Hierarchy.bodySmall, styles.errorText]}>{error}</Text>
      ) : null}

      <View style={styles.quotaBanner}>
        {consultorioRemainingToday === null ? (
          <Text
            style={[
              Hierarchy.bodySmall,
              styles.quotaLine,
              { color: palette.icon ?? palette.text },
            ]}
          >
            Comprobando preguntas disponibles hoy…
          </Text>
        ) : atDailyLimit ? (
          <Text
            style={[
              Hierarchy.bodySmallSemibold,
              styles.quotaLine,
              { color: palette.destructive },
            ]}
          >
            Has usado las 2 preguntas de hoy. Vuelve mañana para seguir
            consultando.
          </Text>
        ) : (
          <>
            <Text
              style={[
                Hierarchy.bodySmall,
                styles.quotaLine,
                { color: palette.text },
              ]}
            >
              {consultorioRemainingToday === 1
                ? 'Te queda 1 pregunta disponible hoy.'
                : `Te quedan ${consultorioRemainingToday} preguntas disponibles hoy.`}
            </Text>
            <Text
              style={[
                Hierarchy.bodySmall,
                styles.bonusHint,
                { color: palette.icon ?? palette.text },
              ]}
            >
              Bonificación por pregunta: +1 000 XP
            </Text>
          </>
        )}
      </View>

      <View style={styles.inputArea}>
        <View style={styles.inputRow}>
          <View style={styles.inputFlex}>
            <ConsultorioComposer
              animationKey={typewriterKey}
              value={questionText}
              onChangeText={setQuestionText}
              editable={!atDailyLimit}
            />
          </View>
          <Pressable
            {...webHoverHandlers}
            onPress={ask}
            disabled={loading || !questionText.trim() || atDailyLimit}
            style={({ pressed }) => [
              styles.sendButton,
              isSendActive ? styles.sendButtonActive : null,
              Platform.OS === 'web' &&
                sendHovered &&
                !isSendActive &&
                !loading &&
                !atDailyLimit && {
                  borderColor: palette.primary,
                  backgroundColor: `${palette.primary}1A`,
                },
              Platform.OS === 'web' &&
                sendHovered &&
                isSendActive &&
                !loading && {
                  opacity: 0.92,
                },
              pressed && Platform.OS !== 'web' ? { opacity: 0.9 } : null,
            ]}
          >
            {loading ? (
              <Text style={styles.sendButtonText}>...</Text>
            ) : (
              <ArrowRight
                size={20}
                color={
                  isSendActive
                    ? (palette.primaryText ?? '#FFF')
                    : sendHovered && Platform.OS === 'web'
                      ? palette.primary
                      : (palette.icon ?? palette.text)
                }
              />
            )}
          </Pressable>
        </View>
      </View>

      <ConsultorioXpRewardModal
        visible={lastAwardedXp != null && lastAwardedXp > 0}
        onClose={dismissXpReward}
        xpAwarded={lastAwardedXp ?? 0}
        remainingToday={consultorioRemainingToday ?? 0}
      />
    </KeyboardAvoidingView>
  );
}

export default IApreguntasScreen;
