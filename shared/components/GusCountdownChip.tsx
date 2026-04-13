import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import { useMascotCountdown } from '@/shared/context/mascot-countdown-context';

function formatMmSs(ms: number): string {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Cuenta atrás discreta hasta el siguiente mensaje del mascota (solo números).
 * Esquina superior derecha, no intercepta toques.
 */
export function GusCountdownChip() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const { remainingMs, phase, isModalOpen } = useMascotCountdown();

  if (
    phase === 'loading' ||
    phase === 'complete' ||
    remainingMs === null ||
    isModalOpen
  ) {
    return null;
  }

  const timeLabel = formatMmSs(remainingMs);
  /** Misma familia visual que la pestaña Cartera / chips del dashboard */
  const chipBg =
    palette.chartAreaBackground ?? palette.surfaceMuted ?? '#F2F4F7';
  const chipBorder = `${palette.primary}30`;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top: insets.top + 10,
          right: 12,
        },
      ]}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`Cuenta atrás ${timeLabel}`}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: chipBg,
            borderColor: chipBorder,
          },
          Platform.select({
            web: {
              boxShadow:
                '0 1px 2px rgba(11, 18, 32, 0.05), 0 4px 12px rgba(29, 78, 216, 0.07)',
            },
            default: {
              shadowColor: '#1D4ED8',
              shadowOpacity: 0.1,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            },
          }),
        ]}
      >
        <Text
          style={[
            Hierarchy.bodySmallSemibold,
            {
              color: palette.primary,
              letterSpacing: 0.3,
            },
          ]}
          numberOfLines={1}
        >
          {timeLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 48,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
