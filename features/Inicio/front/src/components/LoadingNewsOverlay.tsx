import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import TypewriterTextComponent from '@/shared/components/TypewriterTextProps';
import { NOTICIAS_LOADING_MESSAGES } from '../types/inicio.types';
import { loadingNewsOverlayStyles } from './LoadingNewsOverlay.styles';

const MESSAGE_DURATION = 2500;
const FADE_DURATION = 600;

function getRandomMessage() {
  const idx = Math.floor(Math.random() * NOTICIAS_LOADING_MESSAGES.length);
  return NOTICIAS_LOADING_MESSAGES[idx];
}

export type LoadingNewsOverlayProps = {
  visible: boolean;
};

/**
 * Muestra frases aleatorias en estilo chat mientras se procesa la noticia con IA.
 * Mismo estilo que el chat (bubble, Typewriter, fade).
 */
export function LoadingNewsOverlay({ visible }: LoadingNewsOverlayProps) {
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

  return (
    <View style={loadingNewsOverlayStyles.container} pointerEvents="none">
      <Animated.View
        style={[loadingNewsOverlayStyles.bubble, { opacity: fadeAnim }]}
      >
        <TypewriterTextComponent
          text={message}
          speed={25}
          useDefaultFontFamily={false}
          className="border-0 pb-0"
          style={loadingNewsOverlayStyles.text}
        />
      </Animated.View>
    </View>
  );
}
