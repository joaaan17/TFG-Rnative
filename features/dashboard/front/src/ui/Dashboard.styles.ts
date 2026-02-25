import { StyleSheet } from 'react-native';
import type { Palette } from '@/shared/hooks/use-palette';

export function createDashboardStyles(palette: Palette, screenWidth: number) {
  const cardWidth = (screenWidth - 48 - 12) / 2; // 2 cols, padding 24*2, gap 12

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.mainBackground ?? palette.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: palette.surfaceBorder ?? palette.surfaceMuted,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 100,
    },
    profitabilityWrap: {
      marginBottom: 24,
    },
    profitabilityLabel: {
      marginBottom: 4,
      opacity: 0.85,
    },
    profitabilityValue: {
      fontSize: 28,
      letterSpacing: -0.5,
    },
    periodSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: palette.surfaceMuted,
      gap: 6,
      marginTop: 8,
    },
    chartSection: {
      marginBottom: 28,
      alignItems: 'center',
    },
    chartTabs: {
      flexDirection: 'row',
      marginBottom: 16,
      padding: 4,
      borderRadius: 14,
      backgroundColor: `${palette.primary}15`,
      borderWidth: 1,
      borderColor: `${palette.primary}25`,
      alignSelf: 'stretch',
    },
    chartTab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartTabActive: {
      backgroundColor: palette.primary,
    },
    chartTabInactive: {
      backgroundColor: 'transparent',
    },
    donutWrap: {
      marginVertical: 8,
    },
    legendWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 12,
      marginTop: 16,
      paddingHorizontal: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    sectionTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
      marginTop: 8,
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
    metricsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metricCard: {
      width: cardWidth,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
      backgroundColor: palette.cardBackground,
      minHeight: 100,
    },
    metricCardHighlight: {
      backgroundColor: `${palette.primary}12`,
      borderColor: `${palette.primary}35`,
    },
    metricIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    metricLabel: {
      marginBottom: 4,
      opacity: 0.85,
    },
    metricValue: {
      fontSize: 18,
      letterSpacing: -0.2,
    },
  });
}

export default createDashboardStyles;
