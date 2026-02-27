import { StyleSheet } from 'react-native';
import type { Palette } from '@/shared/hooks/use-palette';

export function createInvestmentsStyles(
  palette: Palette,
  screenWidth: number,
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.mainBackground ?? palette.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
    },
    bottomActions: {
      position: 'absolute',
      right: 12,
      bottom: 16,
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      zIndex: 10,
      elevation: 10,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 90,
    },
    tabsWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      minHeight: 48,
      paddingVertical: 4,
      paddingHorizontal: 4,
      borderRadius: 14,
      alignSelf: 'stretch',
      backgroundColor: `${palette.primary}15`,
      borderWidth: 1,
      borderColor: `${palette.primary}30`,
    },
    amountWrap: {
      marginBottom: 24,
    },
    amountValue: {
      fontSize: 28,
      letterSpacing: -0.5,
    },
    amountLabel: {
      marginTop: 4,
      opacity: 0.8,
    },
    chartSection: {
      marginBottom: 28,
      alignSelf: 'stretch',
    },
    chartLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 10,
    },
    chartLabelAccent: {
      width: 3,
      height: 14,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    chartLabelText: {
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
    },
    chartContainer: {
      overflow: 'hidden',
      width: '100%',
      alignSelf: 'stretch',
    },
    sectionTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
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
    assetsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },
    assetCardWrapper: {
      width: (screenWidth - 40 - 14) / 2,
    },
    errorText: {
      paddingVertical: 16,
      textAlign: 'center',
    },
    loadingContainer: {
      paddingVertical: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
