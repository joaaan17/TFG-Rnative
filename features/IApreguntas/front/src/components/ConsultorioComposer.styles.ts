import { StyleSheet } from 'react-native';

export const consultorioComposerStyles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  inputTransparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  placeholderOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    opacity: 1,
  },
});
