import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardModal } from '@/shared/components/card-modal';
import { GusPortraitFrame } from '@/shared/components/GusPortraitFrame';
import { ModalHeader } from '@/shared/components/modal-header';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import { useMascotCountdown } from '@/shared/context/mascot-countdown-context';
import { MASCOT_INVESTOR_DIALOGUES } from '@/shared/data/mascot-investor-dialogues';

function formatMmSs(ms: number): string {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Cuenta atrás discreta hasta el siguiente mensaje del mascota (solo números).
 * Esquina superior derecha; al pulsar abre un modal con información.
 */
export function GusCountdownChip() {
  const insets = useSafeAreaInsets();
  const palette = usePalette();
  const { remainingMs, phase, isModalOpen } = useMascotCountdown();
  const [infoOpen, setInfoOpen] = React.useState(false);

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
    <>
      <View
        style={[
          styles.wrap,
          {
            top: insets.top + 10,
            right: 12,
          },
        ]}
      >
        <Pressable
          onPress={() => setInfoOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Cuenta atrás ${timeLabel}`}
          accessibilityHint="Abre información sobre el temporizador de Gus"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
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
        </Pressable>
      </View>

      <CardModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        maxHeightPct={0.99}
        closeOnBackdropPress
        scrollable
        contentNoPaddingTop
        contentBackgroundColor={palette.cardBackground}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.modalScroll}
        >
          <ModalHeader
            title="Temporizador de Gus"
            subtitle={`${MASCOT_INVESTOR_DIALOGUES.mascot} — tu fan número uno`}
            titleNumberOfLines={2}
            onClose={() => setInfoOpen(false)}
            closeAccessibilityLabel="Cerrar información"
          />
          <View style={styles.modalBody}>
            <GusPortraitFrame
              variant="compact"
              style={{ marginBottom: 20 }}
              accessibilityLabel={MASCOT_INVESTOR_DIALOGUES.mascot}
            />
            <Text
              style={[
                Hierarchy.body,
                { color: palette.text, lineHeight: 22, marginBottom: 12 },
              ]}
            >
              Ese numerito en la esquina no es decoración: es{' '}
              <Text style={{ fontWeight: '600' }}>la cuenta atrás oficial</Text>{' '}
              hasta que {MASCOT_INVESTOR_DIALOGUES.mascot} vuelva a asomarse con
              un consejo, un empujón de ánimo o un guiño de orgullo
              inversor, como cuando celebras un nivel nuevo.
            </Text>
            <Text
              style={[
                Hierarchy.body,
                { color: palette.text, lineHeight: 22, marginBottom: 12 },
              ]}
            >
              INVESTIA programa esos recordatorios según cómo va tu sesión
              (entrada, ratos de uso…). Tranquilo:{' '}
              <Text style={{ fontWeight: '600' }}>
                no toca tu cartera ni tus datos
              </Text>
              ; solo te recuerda que aprender un poco cada día también es un
              buen hábito.
            </Text>
            <Text
              variant="muted"
              style={[Hierarchy.bodySmall, { lineHeight: 20 }]}
            >
              ¿Quieres repetir la charla? Toca el temporizador cuando te apetezca:
              {MASCOT_INVESTOR_DIALOGUES.mascot} no se ofende.
            </Text>
          </View>
        </ScrollView>
      </CardModal>
    </>
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
  modalScroll: {
    paddingBottom: 24,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
});
