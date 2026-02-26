import { StyleSheet } from 'react-native';
import type { Palette } from '@/shared/hooks/use-palette';
import { FontFamilies } from '@/design-system/typography';

export function createDashboardStyles(palette: Palette, screenWidth: number) {
  const cardWidth = (screenWidth - 48 - 12) / 2; // 2 cols, padding 24*2, gap 12

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.mainBackground ?? palette.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
    },
    welcomeBlock: {
      flex: 1,
    },
    welcomeLine1: {
      fontFamily: FontFamilies.body.regular,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    welcomeLine2: {
      fontFamily: FontFamilies.primary.bold,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.3,
      marginTop: 4,
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surfaceMuted,
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
      marginBottom: 20,
    },
    profitabilityCard: {
      borderRadius: 16,
      overflow: 'hidden',
      alignSelf: 'stretch',
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
      shadowColor: '#0B1220',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    profitabilityCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 16,
    },
    profitabilityIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${palette.primary}18`,
    },
    profitabilityTextBlock: {
      flex: 1,
    },
    profitabilityLabel: {
      marginBottom: 4,
      opacity: 0.9,
    },
    profitabilityValue: {
      fontSize: 26,
      letterSpacing: -0.5,
    },
    chartSection: {
      marginBottom: 28,
      alignItems: 'center',
    },
    chartCard: {
      borderRadius: 20,
      overflow: 'hidden',
      alignSelf: 'stretch',
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
      shadowColor: '#0B1220',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    chartCardInner: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 16,
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
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
      overflow: 'hidden',
      minHeight: 100,
    },
    metricCardGradient: {
      flex: 1,
      borderRadius: 16,
      padding: 16,
    },
    metricCardHighlight: {
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
