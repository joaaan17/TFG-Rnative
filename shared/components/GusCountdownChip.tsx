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
        maxHeightPct={0.55}
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
            subtitle={MASCOT_INVESTOR_DIALOGUES.mascot}
            titleNumberOfLines={2}
            onClose={() => setInfoOpen(false)}
            closeAccessibilityLabel="Cerrar información"
          />
          <View style={styles.modalBody}>
            <Text
              style={[
                Hierarchy.body,
                { color: palette.text, lineHeight: 22, marginBottom: 12 },
              ]}
            >
              El tiempo que ves en la esquina es una{' '}
              <Text style={{ fontWeight: '600' }}>cuenta atrás</Text> hasta el
              próximo mensaje de {MASCOT_INVESTOR_DIALOGUES.mascot}, el
              compañero que te da consejos y ánimo mientras usas INVESTIA.
            </Text>
            <Text
              style={[
                Hierarchy.body,
                { color: palette.text, lineHeight: 22, marginBottom: 12 },
              ]}
            >
              Aparece cuando la app programa un recordatorio según el tiempo
              que llevas en la sesión (por ejemplo, al entrar o tras varios
              minutos de uso). No modifica tu cartera ni tus datos: solo
              refuerza el hábito de aprender poco a poco.
            </Text>
            <Text
              variant="muted"
              style={[Hierarchy.bodySmall, { lineHeight: 20 }]}
            >
              Puedes volver a abrir esta explicación en cualquier momento
              pulsando el temporizador.
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
