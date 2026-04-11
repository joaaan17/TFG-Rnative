import { StyleSheet } from 'react-native';
import { Spacing } from '@/design-system/spacing';
import type { Palette } from '@/shared/hooks/use-palette';

/**
 * Estilos del Consultorio alineados con la estética de Cartera/Efectivo:
 * sección con barra azul, paleta unificada, espaciado y bordes redondeados.
 */
export function createIApreguntasStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    // Cabecera tipo "I EVOLUCIÓN DE LA CARTERA": barra azul + título en mayúsculas
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: Spacing.sm,
    },
    headerAccent: {
      width: 3,
      height: 14,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    sectionTitle: {
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
    },
    welcomeArea: {
      alignItems: 'flex-start',
      paddingHorizontal: 20,
      paddingBottom: Spacing.md,
    },
    helloText: {
      color: palette.text,
      marginBottom: 6,
    },
    welcomeText: {
      color: palette.icon ?? palette.text,
      maxWidth: '100%',
    },
    chatAreaWrapper: {
      flex: 1,
      position: 'relative',
    },
    chatArea: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: Spacing.sm,
    },
    chatContent: {
      paddingBottom: Spacing.md,
    },
    xpToastWrap: {
      paddingHorizontal: 20,
      paddingVertical: 6,
      alignItems: 'center',
      minHeight: 36,
    },
    inputArea: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: Spacing.sm,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    inputFlex: {
      flex: 1,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: palette.surfaceMuted ?? palette.background,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    sendButtonText: {
      color: palette.primaryText ?? '#FFF',
      fontSize: 16,
    },
    errorText: {
      color: palette.destructive,
      paddingHorizontal: 20,
      paddingTop: Spacing.sm,
      fontSize: 14,
    },
  });
}

export type IApreguntasStyles = ReturnType<typeof createIApreguntasStyles>;
