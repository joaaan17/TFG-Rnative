import React from 'react';
import { View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import type { ChatMessage } from '../types/iapreguntas.types';
import { chatMessageBubbleStyles } from './ChatMessageBubble.styles';
import { ConsultorioFormattedMessage } from './ConsultorioFormattedMessage';

export type ChatMessageBubbleProps = {
  message: ChatMessage;
};

/**
 * Burbujas de chat alineadas con la paleta de la app (Cartera/Efectivo).
 * Usuario: fondo primary, texto claro. IA: superficie con borde sutil.
 */
export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const palette = usePalette();
  const isUser = message.role === 'user';

  const bubbleStyle = isUser
    ? [
        chatMessageBubbleStyles.bubble,
        chatMessageBubbleStyles.bubbleUser,
        { backgroundColor: palette.primary },
      ]
    : [
        chatMessageBubbleStyles.bubble,
        chatMessageBubbleStyles.bubbleAssistant,
        {
          backgroundColor: palette.surfaceMuted ?? palette.background,
          borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
        },
      ];

  const textStyle = isUser
    ? [
        Hierarchy.body,
        chatMessageBubbleStyles.textUser,
        { color: palette.primaryText ?? '#FFF' },
      ]
    : [
        Hierarchy.body,
        chatMessageBubbleStyles.textAssistant,
        { color: palette.text },
      ];

  return (
    <View style={bubbleStyle}>
      {isUser ? (
        <Text style={textStyle}>{message.content}</Text>
      ) : (
        <ConsultorioFormattedMessage
          content={message.content}
          baseTextStyle={textStyle}
        />
      )}
    </View>
  );
}
