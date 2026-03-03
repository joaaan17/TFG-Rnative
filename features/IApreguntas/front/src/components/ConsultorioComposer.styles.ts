import { StyleSheet } from 'react-native';
import { Spacing } from '@/design-system/spacing';

/**
 * Input del Consultorio: mismo lenguaje visual que Cartera/Efectivo.
 * Bordes redondeados, borde completo, fondo de superficie.
 */
export const consultorioComposerStyles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputWrapper: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    minHeight: 44,
    borderRadius: 12,
  },
});
