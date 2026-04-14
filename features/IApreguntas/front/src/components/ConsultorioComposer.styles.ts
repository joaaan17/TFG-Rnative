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
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    /** Permite que el TextInput multilínea crezca hasta maxHeight del input */
    maxHeight: 200,
  },
  input: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 48,
    maxHeight: 200,
    borderRadius: 12,
    lineHeight: 22,
  },
});
