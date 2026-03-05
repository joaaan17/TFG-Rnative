import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import { Hierarchy } from '@/design-system/typography';
import type { Palette } from '@/shared/hooks/use-palette';

function cardShadow(): ViewStyle {
  return Platform.select({
    android: { elevation: 6 },
    default: {
      shadowColor: '#0B0A09',
      shadowOpacity: 0.07,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
  }) as ViewStyle;
}

/** Misma sombra que el botón "Agregar Amigos" en perfil. */
function tightShadow(): ViewStyle {
  return Platform.select({
    android: { elevation: 6 },
    default: {
      shadowColor: '#0B0A09',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
  }) as ViewStyle;
}

export function createNewsCardStyles(palette: Palette) {
  const isDark = palette.background === '#070B14';
  const cardBg = isDark ? palette.cardBackground : '#FFFFFF';
  const borderColor = isDark
    ? (palette.surfaceBorder ?? 'rgba(255,255,255,0.06)')
    : 'rgba(0,0,0,0.06)';

  return StyleSheet.create({
    card: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor,
      borderLeftWidth: 3,
      borderLeftColor: palette.primary,
      ...cardShadow(),
    },
    imageWrap: {
      width: '100%',
      height: 220,
      backgroundColor: palette.surfaceMuted ?? '#F1F3F5',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    imagePlaceholderIconWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    imagePlaceholderLabel: {
      ...Hierarchy.captionSmall,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      opacity: 0.7,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 14,
      flex: 1,
      justifyContent: 'space-between',
    },
    contentBody: {
      flex: 1,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    sectionAccent: {
      width: 3,
      height: 18,
      borderRadius: 2,
      backgroundColor: palette.primary,
    },
    sectionLabel: {
      ...Hierarchy.titleSection,
      color: palette.text,
      letterSpacing: 1.2,
      opacity: 0.85,
    },
    title: {
      ...Hierarchy.titleModal,
      color: palette.text,
      lineHeight: 26,
      marginBottom: 12,
    },
    excerpt: {
      ...Hierarchy.body,
      color: palette.icon ?? palette.text,
      lineHeight: 22,
      opacity: 0.88,
      marginBottom: 18,
    },
    ctaWrap: {
      width: '100%',
      marginTop: 4,
    },
    /** Mismo tamaño y características que el botón "Agregar Amigos" (Profile): borderRadius 16, tightShadow. */
    ctaButton: {
      width: '100%',
      borderRadius: 16,
      ...tightShadow(),
    },
  });
}

export default createNewsCardStyles;
