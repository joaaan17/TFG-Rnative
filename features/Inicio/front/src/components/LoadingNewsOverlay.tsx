import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { usePalette } from '@/shared/hooks/use-palette';
import {
  NOTICIAS_LOADING_MESSAGES,
  QUIZ_LOADING_MESSAGES,
} from '../types/inicio.types';
import { loadingNewsOverlayStyles } from './LoadingNewsOverlay.styles';

const MESSAGE_DURATION = 2500;
const FADE_DURATION = 600;

export type LoadingNewsOverlayProps = {
  visible: boolean;
  /** Mensajes opcionales (p. ej. para quiz). Si no se pasa, usa NOTICIAS_LOADING_MESSAGES. */
  messages?: readonly string[];
};

/**
 * Muestra frases aleatorias en estilo chat mientras se procesa la noticia con IA o el quiz.
 * Mismo estilo que el chat (bubble, Typewriter, fade).
 */
export function LoadingNewsOverlay({
  visible,
  messages = NOTICIAS_LOADING_MESSAGES,
}: LoadingNewsOverlayProps) {
  const palette = usePalette();
  const getRandomMessage = () => {
    const list = messages;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  };
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
  }, [visible, fadeAnim, messages]);

  if (!visible) return null;

  return (
    <View style={[loadingNewsOverlayStyles.container, { pointerEvents: 'none' }]}>
      <Animated.View
        style={[
          loadingNewsOverlayStyles.bubble,
          {
            opacity: fadeAnim,
            backgroundColor: palette.cardBackground,
            borderColor: palette.surfaceBorder ?? palette.text,
          },
        ]}
      >
        <TypewriterTextComponent
          text={message}
          speed={25}
          useDefaultFontFamily={false}
          className="border-0 pb-0"
          style={[loadingNewsOverlayStyles.text, { color: palette.text }]}
        />
      </Animated.View>
    </View>
  );
}
