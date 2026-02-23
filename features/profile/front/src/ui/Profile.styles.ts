import { Platform, StyleSheet, type ViewStyle } from 'react-native';

import { TextStyles } from '@/design-system/typography';
import type { Palette } from '@/shared/hooks/use-palette';

function softShadow(): ViewStyle {
  return Platform.select({
    android: {
      elevation: 10,
    },
    default: {
      shadowColor: '#0B0A09',
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
  }) as ViewStyle;
}

function tightShadow(): ViewStyle {
  return Platform.select({
    android: {
      elevation: 6,
    },
    default: {
      shadowColor: '#0B0A09',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
    },
  }) as ViewStyle;
}

export function createProfileStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.mainBackground ?? palette.background,
    },
    scrollContent: {
      paddingBottom: 220,
    },

    // Hero / header
    topCard: {
      marginTop: 12,
      marginHorizontal: 16,
      minHeight: 220,
      width: 'auto',
      borderRadius: 28,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.text,
      backgroundColor: palette.cardBackground,
      overflow: 'hidden',
      ...softShadow(),
    },
    topCardHeader: {
      paddingTop: 18,
      paddingHorizontal: 18,
      paddingBottom: 0,
    },
    topCardTitle: {
      color: palette.text,
      textAlign: 'center',
    },
    topCardDecorA: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor: `${palette.primary}22`,
      top: -120,
      left: -90,
    },
    topCardDecorB: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 999,
      backgroundColor: `${palette.primary}14`,
      top: -160,
      right: -140,
    },
    topCardCenter: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 14,
      paddingBottom: 18,
    },
    settingsButton: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 42,
      height: 42,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.text,
      backgroundColor: palette.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
      ...tightShadow(),
    },

    joinedTextWrapper: {
      paddingHorizontal: 16,
      paddingTop: 10,
      alignItems: 'center',
      gap: 4,
    },
    errorText: {
      marginTop: 2,
      fontSize: 12,
      opacity: 0.9,
    },

    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 14,
    },
    statItem: {
      flex: 1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.text,
      backgroundColor: palette.cardBackground,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      ...tightShadow(),
    },
    statValue: {
      textAlign: 'center',
    },
    statLabel: {
      textAlign: 'center',
      marginTop: 2,
      opacity: 0.9,
    },

    // Actions
    addFriendsWrapper: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 14,
    },
    addFriendsRowSecond: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    addFriendsButton: {
      flex: 1,
      borderRadius: 16,
      ...tightShadow(),
    },
    addFriendsButtonFullWidth: {
      width: '100%',
      borderRadius: 16,
      ...tightShadow(),
    },

    // Sections
    summaryWrapper: {
      paddingHorizontal: 16,
      paddingTop: 18,
    },
    summaryTitle: {
      ...TextStyles.sectionLabel,
      opacity: 0.65,
      letterSpacing: 1.4,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    sectionTitleAccent: {
      width: 3,
      height: 18,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    sectionCard: {
      marginTop: 12,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.text,
      backgroundColor: palette.cardBackground,
      padding: 14,
      ...softShadow(),
    },
    summaryGrid: {
      rowGap: 10,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 10,
    },
    summaryItem: {
      flex: 1,
      borderRadius: 18,
      backgroundColor: palette.surfaceMuted ?? palette.inputBackground,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.text,
      paddingVertical: 14,
      paddingHorizontal: 12,
      ...tightShadow(),
    },
    summaryValue: {
      textAlign: 'center',
    },
    summaryValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryIconPill: {
      width: 30,
      height: 30,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${palette.primary}1A`,
      borderWidth: 1,
      borderColor: palette.surfaceBorder ?? palette.text,
      marginRight: 10,
    },

    logrosRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 12,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export default createProfileStyles;
