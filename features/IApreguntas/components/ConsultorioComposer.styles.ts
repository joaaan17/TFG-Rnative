import { StyleSheet } from 'react-native';

export const consultorioComposerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  placeholderOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});
