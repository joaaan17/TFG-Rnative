import { Platform, StyleSheet } from 'react-native';
import type { Palette } from '@/shared/hooks/use-palette';
import { Spacing } from '@/design-system/spacing';

/** Misma sombra que las cards inferiores. En web usar boxShadow (shadow* deprecado). */
const cardShadow = Platform.select({
  android: { elevation: 2 },
  web: { boxShadow: '0 1px 2px rgba(11, 18, 32, 0.05)' },
  default: {
    shadowColor: '#0B0A09',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});

/**
 * Estilos del Dashboard. Mismo fondo y cards que el resto de la app (palette).
 */
export function createDashboardStyles(palette: Palette, screenWidth: number) {
  const paddingH = 20;
  const gap = 12;
  // Math.floor evita que el redondeo de decimales en Android haga que
  // la suma de tarjetas + gaps supere el ancho del contenedor.
  const cardWidth = Math.floor((screenWidth - paddingH * 2 - gap) / 2);
  /** Ancho para 3 cards por fila (2 gaps entre ellas). */
  const cardWidthThree = Math.floor((screenWidth - paddingH * 2 - gap * 2) / 3);

  const cardBg = palette.surfaceMuted ?? palette.background;
  const cardBorder = palette.surfaceBorder ?? palette.surfaceMuted;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.mainBackground ?? palette.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: paddingH,
      paddingTop: Spacing.md,
      paddingBottom: 100,
    },
    // Título principal "Estadísticas"
    sectionTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: Spacing.md,
    },
    sectionTitleAccent: {
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
    // Resumen global: mismo estilo que las cards inferiores (blanco + barra lateral azul)
    summaryCard: {
      borderRadius: 20,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: cardBorder,
      borderLeftWidth: 3,
      borderLeftColor: palette.primary,
      ...(cardShadow as object),
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: cardBorder,
    },
    summaryRowLast: {
      borderBottomWidth: 0,
    },
    summaryLabel: {
      opacity: 0.9,
    },
    summaryValue: {
      fontSize: 16,
      letterSpacing: -0.2,
    },
    // Donut (diversificación): bloque con fondo suave y esquinas redondeadas (alineado con stat cards / resumen)
    donutCard: {
      padding: Spacing.md,
      marginBottom: Spacing.lg,
      borderRadius: 16,
      overflow: 'hidden' as const,
      backgroundColor: palette.mainBackground ?? palette.background,
      borderWidth: 1,
      borderColor: cardBorder,
      ...(cardShadow as object),
    },
    /** Selector sector / geográfica / acciones: pill deslizante detrás de la pestaña activa. */
    donutTabsWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: Spacing.md,
      position: 'relative',
    },
    /** Pill animada que se desliza entre pestañas (posición y ancho vía Reanimated). */
    donutTabPill: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
    },
    donutTab: {
      paddingVertical: 10,
      paddingHorizontal: 24,
    },
    donutWrap: {
      alignItems: 'center',
      marginVertical: 8,
    },
    // Context cards (debajo del gráfico): mejor/peor inversión, activos, operaciones
    contextGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      // width:'100%' es imprescindible en Android: flexDirection:'row' + flexWrap
      // hace que el contenedor se encoja al tamaño de su contenido, ignorando el
      // ancho del padre. Sin él, justifyContent:'space-between' no tiene espacio
      // extra que distribuir y las tarjetas quedan apiladas a la izquierda.
      width: '100%',
      justifyContent: 'space-between',
      rowGap: gap,
      marginBottom: Spacing.lg,
    },
    contextCard: {
      // Math.floor evita que el redondeo de decimales desborde el contenedor.
      width: cardWidthThree,
    },
    /** Activo dominante: ocupa toda la fila debajo del grid */
    contextCardDominant: {
      width: '100%' as const,
    },
    /** Última operación: ocupa todo el ancho del panel */
    contextCardLastOperation: {
      width: '100%' as const,
    },
    /** Layout dos columnas: título/headline izq, detalles operación der (vertical) */
    contextLastOpRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      gap: 16,
    },
    contextLastOpLeft: {
      flexShrink: 0,
    },
    contextLastOpRight: {
      flex: 1,
      alignItems: 'flex-end' as const,
    },
    contextLastOpDetail: {
      fontSize: 12,
      opacity: 0.88,
    },
    contextLastOpDetailSpaced: {
      marginBottom: 2,
    },
    contextLabel: {
      marginBottom: 4,
      opacity: 0.9,
    },
    contextValue: {
      fontSize: 18,
      letterSpacing: -0.2,
      marginBottom: 2,
    },
    contextPercent: {
      fontSize: 16,
      letterSpacing: -0.2,
    },
    // Grid 2x2 de métricas
    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap,
      marginBottom: Spacing.lg,
    },
    statCard: {
      width: cardWidth,
      borderRadius: 16,
      padding: Spacing.md,
      minHeight: 120,
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: cardBorder,
    },
    statCardHighlighted: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    statValue: {
      fontSize: 28,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    statLabel: {
      marginBottom: Spacing.sm,
      opacity: 0.95,
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      alignSelf: 'stretch',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    // Sección Ingresos: título + tabs
    incomeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    incomeTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    periodTabs: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 12,
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: cardBorder,
    },
    periodTab: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    periodTabActive: {
      backgroundColor: palette.primary,
    },
    periodTabInactive: {
      backgroundColor: 'transparent',
    },
    // Contenedor del gráfico
    chartCard: {
      borderRadius: 16,
      padding: Spacing.md,
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: cardBorder,
      marginTop: Spacing.sm,
    },
  });
}

export type DashboardStyles = ReturnType<typeof createDashboardStyles>;
