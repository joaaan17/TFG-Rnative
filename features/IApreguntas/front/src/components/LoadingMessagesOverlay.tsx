import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { IA_PREGUNTAS_LOADING_MESSAGES } from '../types/iapreguntas.types';
import { chatMessageBubbleStyles } from './ChatMessageBubble.styles';
import { loadingOverlayStyles } from './LoadingMessagesOverlay.styles';

const MESSAGE_DURATION = 2500;
const FADE_DURATION = 600;

function getRandomMessage() {
  const idx = Math.floor(Math.random() * IA_PREGUNTAS_LOADING_MESSAGES.length);
  return IA_PREGUNTAS_LOADING_MESSAGES[idx];
}

export type LoadingMessagesOverlayProps = {
  visible: boolean;
  /** Si true, se renderiza en línea como mensaje del chat (no overlay) */
  inline?: boolean;
};

/**
 * Muestra mensajes aleatorios sobre bolsa con efecto fade suave
 * mientras se espera la respuesta de la IA.
 * En modo inline aparece como siguiente mensaje, con el mismo estilo
 * que la respuesta de ChatGPT y efecto Typewriter.
 */
export function LoadingMessagesOverlay({
  visible,
  inline = false,
}: LoadingMessagesOverlayProps) {
  const [message, setMessage] = useState(() => getRandomMessage());
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    const showMessage = () => {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    };

    const hideAndCycle = () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setMessage(getRandomMessage());
        showMessage();
      });
    };

    showMessage();
    const interval = setInterval(hideAndCycle, MESSAGE_DURATION);

    return () => clearInterval(interval);
  }, [visible, fadeAnim]);

  if (!visible) return null;

  const bubbleStyles = inline
    ? [
        chatMessageBubbleStyles.bubble,
        chatMessageBubbleStyles.bubbleAssistant,
        { opacity: fadeAnim },
      ]
    : [loadingOverlayStyles.messageBox, { opacity: fadeAnim }];

  return (
    <View
      style={[
        loadingOverlayStyles.container,
        inline && loadingOverlayStyles.containerInline,
        { pointerEvents: 'none' },
      ]}
    >
      <Animated.View style={bubbleStyles}>
        <TypewriterTextComponent
          text={message}
          speed={25}
          useDefaultFontFamily={false}
          className="border-0 pb-0"
          style={chatMessageBubbleStyles.textAssistant}
        />
      </Animated.View>
    </View>
  );
}
