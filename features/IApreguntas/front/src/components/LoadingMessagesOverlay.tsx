import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { usePalette } from '@/shared/hooks/use-palette';
import { chatMessageBubbleStyles } from './ChatMessageBubble.styles';
import { loadingOverlayStyles } from './LoadingMessagesOverlay.styles';

const DOT_SIZE = 3;
const DOT_GAP = 4;
const BLINK_MS = 420;

/**
 * Tres puntos muy compactos con parpadeo suave (sin texto).
 */
function TypingDotsIndicator({ color }: { color: string }) {
  const blink = useRef(new Animated.Value(0.38)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, {
          toValue: 1,
          duration: BLINK_MS,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 0.2,
          duration: BLINK_MS,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [blink]);

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 1,
        paddingHorizontal: 1,
        opacity: blink,
      }}
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: color,
            marginLeft: i === 0 ? 0 : DOT_GAP,
          }}
        />
      ))}
    </Animated.View>
  );
}

export type LoadingMessagesOverlayProps = {
  visible: boolean;
  /** Si true, se renderiza en línea como mensaje del chat (no overlay) */
  inline?: boolean;
};

/**
 * Estado de carga mientras la IA responde: solo indicador visual, sin texto.
 */
export function LoadingMessagesOverlay({
  visible,
  inline = false,
}: LoadingMessagesOverlayProps) {
  const palette = usePalette();
  const dotColor = palette.primary ?? '#2563eb';

  if (!visible) return null;

  if (inline) {
    return (
      <View
        style={[
          loadingOverlayStyles.containerInline,
          { pointerEvents: 'none' },
        ]}
      >
        <View
          style={[
            chatMessageBubbleStyles.bubble,
            chatMessageBubbleStyles.bubbleAssistant,
            {
              alignSelf: 'flex-start',
              backgroundColor: palette.surfaceMuted ?? palette.background,
              borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
              paddingVertical: 6,
              paddingHorizontal: 10,
            },
          ]}
        >
          <TypingDotsIndicator color={dotColor} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        loadingOverlayStyles.container,
        { pointerEvents: 'none' },
      ]}
    >
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 12,
          backgroundColor: palette.surfaceMuted ?? palette.background,
          borderWidth: 1,
          borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
        }}
      >
        <TypingDotsIndicator color={dotColor} />
      </View>
    </View>
  );
}
