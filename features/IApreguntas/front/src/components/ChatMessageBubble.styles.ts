import { StyleSheet } from 'react-native';

/** Layout de burbujas; colores inyectados por ChatMessageBubble con usePalette. */
export const chatMessageBubbleStyles = StyleSheet.create({
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  textUser: {
    fontWeight: '500',
  },
  textAssistant: {},
});
