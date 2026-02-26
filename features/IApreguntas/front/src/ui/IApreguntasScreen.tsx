import React, { useRef, useEffect } from 'react';
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

import { iaPreguntasStyles } from './IApreguntas.styles';
import { useIApreguntasViewModel } from '../state/useIApreguntasViewModel';
import { ConsultorioComposer } from '../components/ConsultorioComposer';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { LoadingMessagesOverlay } from '../components/LoadingMessagesOverlay';

/**
 * Pantalla tonta, limpia, sin inteligencia.
 * Solo renderiza y conecta props/handlers del ViewModel.
 */
export function IApreguntasScreen() {
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

  return (
    <KeyboardAvoidingView
        style={iaPreguntasStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={iaPreguntasStyles.header}>
          <TypewriterTextComponent
            key={typewriterKey}
            text="CONSULTORIO"
            speed={40}
            variant="h3"
            className="border-0 pb-0"
          />
        </View>

        <View style={iaPreguntasStyles.welcomeArea}>
          <Text variant="h4" style={iaPreguntasStyles.helloText}>
            Hola Joan
          </Text>
          <TypewriterTextComponent
            key={`welcome-${typewriterKey}`}
            text={welcomeText}
            speed={30}
            useDefaultFontFamily={false}
            className="border-0 pb-0 text-center"
            style={iaPreguntasStyles.welcomeText}
          />
        </View>

        <View style={iaPreguntasStyles.chatAreaWrapper}>
          <FlatList
            ref={flatListRef}
            style={iaPreguntasStyles.chatArea}
            contentContainerStyle={iaPreguntasStyles.chatContent}
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
          <Text variant="muted" style={iaPreguntasStyles.errorText}>
            {error}
          </Text>
        ) : null}

        <View style={iaPreguntasStyles.inputArea}>
          <View style={iaPreguntasStyles.inputRow}>
            <View style={iaPreguntasStyles.inputFlex}>
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
                iaPreguntasStyles.sendButton,
                questionText.trim().length > 0
                  ? iaPreguntasStyles.sendButtonActive
                  : null,
              ]}
            >
              {loading ? (
                <Text style={iaPreguntasStyles.sendButtonText}>...</Text>
              ) : (
                <ArrowRight size={20} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
  );
}

export default IApreguntasScreen;
