import { Platform, StyleSheet } from 'react-native';

import type { Palette } from '@/shared/hooks/use-palette';
import { Spacing } from '@/design-system/spacing';

export function createCashStyles(palette: Palette) {
  return StyleSheet.create({
    header: {
      paddingTop: 0,
      paddingBottom: Spacing.md,
      paddingHorizontal: 0,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
    },
    headerTitleAccent: {
      width: 3,
      height: 14,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    headerLabelWrap: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
    headerTitle: {
      marginBottom: 0,
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
    },
    headerSubtitle: {
      marginBottom: 0,
      opacity: 0.85,
    },
    headerBalanceWrap: {
      flexShrink: 0,
      marginLeft: Spacing.sm,
      alignItems: 'flex-end',
    },
    headerBalance: {
      letterSpacing: -0.5,
    },
    headerVariation: {
      marginTop: Spacing.xs,
      opacity: 0.75,
    },
    summary: {
      paddingVertical: Spacing.md,
      paddingHorizontal: 0,
      marginBottom: Spacing.md,
      borderRadius: 12,
      backgroundColor: palette.surfaceMuted ?? palette.chartAreaBackground,
      overflow: 'hidden',
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.xs,
    },
    summaryRowLast: {
      marginBottom: 0,
    },
    summaryBarWrap: {
      height: 4,
      borderRadius: 2,
      backgroundColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)',
      marginTop: Spacing.sm,
      overflow: 'hidden',
    },
    sectionTitle: {
      marginBottom: Spacing.sm,
    },
    transactionList: {
      paddingBottom: Spacing.xxl,
    },
    group: {
      marginBottom: Spacing.lg,
    },
    groupLabel: {
      marginBottom: Spacing.xs,
      paddingHorizontal: 0,
    },
    itemWrap: {
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.06)',
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    itemBody: {
      flex: 1,
      minWidth: 0,
    },
    itemAmount: {
      marginLeft: Spacing.sm,
      minWidth: 88,
      alignItems: 'flex-end',
    },
    // Título encima del calendario
    calendarTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: Spacing.sm,
      alignSelf: 'stretch',
    },
    calendarTitleIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calendarTitleAccent: {
      width: 3,
      height: 14,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    calendarTitleText: {
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
    },
    // Calendario (bloque tipo referencia: fondo primary, mes centrado, L M X J V S D)
    calendarBlock: {
      marginHorizontal: -20,
      marginBottom: 0,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.lg,
      paddingHorizontal: Spacing.md,
      overflow: 'hidden',
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.xs,
      marginBottom: Spacing.md,
    },
    calendarMonthTitle: {
      textTransform: 'capitalize',
    },
    calendarNav: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    calendarNavButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekdaysRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.xs,
      marginBottom: Spacing.xs,
    },
    weekdayCell: {
      flex: 1,
      alignItems: 'center',
    },
    gridRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 2,
    },
    dayCell: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.sm,
      minHeight: 40,
    },
    dayNumber: {
      fontSize: 15,
    },
    dayNumberFaded: {
      opacity: 0.5,
    },
    daySelectedRing: {
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.9)',
    },
    dayDots: {
      position: 'absolute',
      bottom: 4,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 2,
    },
    dayDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    // Panel tipo modal de fondo: ancho completo hasta el menú inferior de navegación
    daySheetWrap: {
      marginTop: -30,
      marginHorizontal: -20,
      marginBottom: -160,
      paddingTop: Spacing.md,
      paddingHorizontal: Spacing.md,
      paddingBottom: 48,
      borderTopWidth: 0,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      minHeight: 240,
      ...(Platform.OS !== 'web' && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
      }),
    },
    daySheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: Spacing.md,
    },
    daySheetTitle: {
      marginBottom: Spacing.md,
    },
    daySheetCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      borderRadius: 12,
      minHeight: 72,
    },
    daySheetCardAccent: {
      width: 4,
      borderRadius: 2,
      marginRight: Spacing.md,
      alignSelf: 'stretch',
    },
    daySheetCardBody: {
      flex: 1,
      minWidth: 0,
    },
    daySheetCardAmount: {
      marginLeft: Spacing.sm,
      minWidth: 88,
      alignItems: 'flex-end',
    },
  });
}
