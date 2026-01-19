import { StyleSheet } from 'react-native';

export const appShellStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  menubar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 1000,
    elevation: 24,
  },
});

export function getAppShellMenubarStyle(bottomInset: number) {
  return {
    paddingBottom: Math.max(bottomInset, 6),
  } as const;
}
