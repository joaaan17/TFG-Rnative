import React, { useMemo, useRef, useEffect } from 'react';
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
import { ConsultorioComposer } from '../components/ConsultorioComposer';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { LoadingMessagesOverlay } from '../components/LoadingMessagesOverlay';

/**
 * Pantalla tonta, limpia, sin inteligencia.
 * Solo renderiza y conecta props/handlers del ViewModel.
 */
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
  } = useIApreguntasViewModel();

  useEffect(() => {
    if (messages.length > 0 || loading) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length, loading]);

  const containerBg = palette.mainBackground ?? palette.background;
  const isSendActive = questionText.trim().length > 0 && !loading;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: containerBg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerAccent} />
        <TypewriterTextComponent
          key={typewriterKey}
          text="CONSULTORIO"
          speed={40}
          useDefaultFontFamily={false}
          suppressVariant
          style={[
            Hierarchy.titleSection,
            {
              fontSize: 11,
              letterSpacing: 1.4,
              color: palette.icon ?? palette.text,
            },
          ]}
        />
      </View>

      <View style={styles.welcomeArea}>
        <Text
          style={[Hierarchy.bodySmallSemibold, styles.helloText]}
        >
          Hola Joan
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
        <Text style={[Hierarchy.bodySmall, styles.errorText]}>
          {error}
        </Text>
      ) : null}

      <View style={styles.inputArea}>
        <View style={styles.inputRow}>
          <View style={styles.inputFlex}>
            <ConsultorioComposer
              animationKey={typewriterKey}
              value={questionText}
              onChangeText={setQuestionText}
            />
          </View>
          <Pressable
            onPress={ask}
            disabled={loading || !questionText.trim()}
            style={[
              styles.sendButton,
              isSendActive ? styles.sendButtonActive : null,
            ]}
          >
            {loading ? (
              <Text style={styles.sendButtonText}>...</Text>
            ) : (
              <ArrowRight
                size={20}
                color={isSendActive ? (palette.primaryText ?? '#FFF') : (palette.icon ?? palette.text)}
              />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default IApreguntasScreen;
