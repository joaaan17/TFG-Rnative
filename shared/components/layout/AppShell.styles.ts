import { StyleSheet } from 'react-native';

export const appShellStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  menubar: {
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#000',
  },
});

export function getAppShellMenubarStyle(bottomInset: number) {
  return {
    paddingBottom: Math.max(bottomInset, 6),
  } as const;
}
