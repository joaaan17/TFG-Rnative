import React from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import type { ChatMessage } from '../types/iapreguntas.types';
import { chatMessageBubbleStyles } from './ChatMessageBubble.styles';

export type ChatMessageBubbleProps = {
  message: ChatMessage;
};

/**
 * Componente presentacional para un mensaje del chat.
 * Usuario: fondo negro, texto blanco. IA: fondo blanco, texto negro.
 * Los mensajes de la IA usan Typewriter para que el texto aparezca poco a poco.
 */
export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const textStyles = isUser
    ? chatMessageBubbleStyles.textUser
    : chatMessageBubbleStyles.textAssistant;

  return (
    <View
      style={[
        chatMessageBubbleStyles.bubble,
        isUser ? chatMessageBubbleStyles.bubbleUser : chatMessageBubbleStyles.bubbleAssistant,
      ]}
    >
      {isUser ? (
        <Text
          className="text-white"
          style={textStyles}
        >
          {message.content}
        </Text>
      ) : (
        <TypewriterTextComponent
          text={message.content}
          speed={25}
          useDefaultFontFamily={false}
          className="border-0 pb-0"
          style={textStyles}
        />
      )}
    </View>
  );
}
