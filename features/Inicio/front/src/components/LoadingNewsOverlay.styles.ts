import { StyleSheet } from 'react-native';

export const loadingNewsOverlayStyles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '90%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  text: { fontSize: 15 },
});
