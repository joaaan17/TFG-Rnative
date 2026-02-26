import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import type { Palette } from '@/shared/hooks/use-palette';
import { TextStyles } from '@/design-system/typography';

function softShadow(): ViewStyle {
  return Platform.select({
    android: { elevation: 10 },
    default: {
      shadowColor: '#0B0A09',
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
  }) as ViewStyle;
}

export function createInicioStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.mainBackground ?? palette.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 220,
    },
    masthead: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
    },
    mastheadGreeting: {
      letterSpacing: 0.8,
      opacity: 0.7,
    },
    mastheadTitle: {
      marginTop: 4,
    },
    mastheadDate: {
      marginTop: 6,
      letterSpacing: 0.3,
      opacity: 0.6,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },

    heroCard: {
      marginTop: 12,
      marginBottom: 12,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.text,
      backgroundColor: palette.cardBackground,
      overflow: 'hidden',
      minHeight: 120,
      ...softShadow(),
    },
    heroDecorA: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 999,
      backgroundColor: `${palette.primary}18`,
      top: -130,
      left: -90,
    },
    heroDecorB: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 999,
      backgroundColor: `${palette.primary}10`,
      top: -160,
      right: -140,
    },
    heroInner: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 16,
      gap: 6,
    },
    heroKickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    heroAccent: {
      width: 3,
      height: 18,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    heroKicker: {
      ...TextStyles.sectionLabel,
      opacity: 0.65,
      letterSpacing: 1.4,
    },
  });
}

/** Estilos del modal de noticia: minimalista y moderno, con paleta del design system. */
export function createNewsModalStyles(palette: Palette) {
  return StyleSheet.create({
    newsModalContent: {
      flex: 1,
      minHeight: 0,
      backgroundColor: palette.background,
    },
    newsScroll: {
      flex: 1,
    },
    newsScrollContent: {
      paddingBottom: 32,
    },
    /* Hero hasta el borde superior: imagen detrás de la barra de arrastre (solo este modal). */
    newsHeroWrap: {
      width: '100%',
      height: 274,
      marginTop: -54,
      marginBottom: 24,
      position: 'relative',
      backgroundColor: palette.surfaceMuted ?? palette.cardBackground,
    },
    newsHeroImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    newsHeroScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.28)',
    },
    newsHeroActions: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 54 + 16,
      zIndex: 10,
      elevation: 10,
    },
    /** Capa fija fuera del ScrollView para que los botones del hero reciban toques */
    newsHeroActionsOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
      zIndex: 20,
      elevation: 20,
    },
    newsHeroButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    newsMetaRow: {
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    newsMetaText: {
      fontSize: 12,
      letterSpacing: 0.8,
    },
    newsTitleWrap: {
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    newsStatsRow: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'stretch',
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 8,
    },
    newsStatCard: {
      flex: 1,
      backgroundColor: `${palette.primary}22`,
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderRadius: 10,
      minWidth: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    newsStatCardText: {
      fontSize: 12,
      letterSpacing: 0.2,
      textAlign: 'center',
    },
    newsReadingCard: {
      marginHorizontal: 20,
      marginTop: 8,
      marginBottom: 24,
      borderRadius: 20,
      paddingVertical: 24,
      paddingHorizontal: 20,
      backgroundColor: palette.cardBackground ?? palette.background,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? 'transparent',
    },
    newsSection: {
      paddingHorizontal: 0,
      marginBottom: 28,
    },
    newsSectionLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    newsSectionAccent: {
      width: 3,
      height: 18,
      borderRadius: 2,
      backgroundColor: palette.primary,
    },
    newsSectionLabel: {
      letterSpacing: 1.2,
    },
    newsSectionDivider: {
      height: 1,
      borderTopWidth: 1,
      borderStyle: 'dashed',
      borderColor: palette.surfaceBorder ?? palette.icon,
      opacity: 0.6,
      marginBottom: 18,
    },
    newsLead: {
      lineHeight: 26,
    },
    /* Contenedor del CTA al final del modal: sin caja blanca, solo espaciado y separador sutil */
    quizButtonContainer: {
      width: '100%',
      paddingHorizontal: 20,
      paddingTop: 32,
      paddingBottom: 40,
      marginTop: 8,
      alignItems: 'center',
    },
    quizButton: {
      width: '100%',
      borderRadius: 14,
    },
  });
}

export default createInicioStyles;
