import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';

export type AchievementRewardModalProps = {
  open: boolean;
  onClose: () => void;
  grants: { level: number; amountUsd: number }[];
  totalGrantedUsd: number;
};

/**
 * Modal al desbloquear logros de nivel con recompensa en efectivo para la cartera.
 */
export function AchievementRewardModal({
  open,
  onClose,
  grants,
  totalGrantedUsd,
}: AchievementRewardModalProps) {
  const palette = usePalette();
  const [contentHeight, setContentHeight] = React.useState<
    number | undefined
  >();

  React.useEffect(() => {
    if (!open) setContentHeight(undefined);
  }, [open]);

  const cardBg =
    palette.background === '#070B14' || palette.background?.startsWith('#0')
      ? (palette.surfaceMuted ?? '#1B2A45')
      : (palette.surfaceMuted ?? '#EEF2F7');

  const cardShadow = Platform.select({
    android: { elevation: 1 },
    web: { boxShadow: '0 1px 2px rgba(11, 18, 32, 0.06)' },
    default: {
      shadowColor: '#0B0A09',
      shadowOpacity: 0.06,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    },
  });

  const title =
    grants.length === 1
      ? `¡Logro: nivel ${grants[0].level}!`
      : `¡${grants.length} logros desbloqueados!`;

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.88}
      closeOnBackdropPress
      scrollable
      contentHeight={contentHeight}
      contentNoPaddingTop
      contentBackgroundColor={palette.cardBackground}
    >
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled
        onContentSizeChange={(_, h) => setContentHeight(h)}
        contentContainerStyle={styles.scrollContent}
      >
        <ModalHeader
          title={title}
          subtitle="Recompensa en tu cartera para invertir"
          titleNumberOfLines={3}
          subtitleNumberOfLines={2}
          onClose={onClose}
          closeAccessibilityLabel="Cerrar"
        />
        <View style={styles.content}>
          <View
            style={[
              styles.totalCard,
              { backgroundColor: cardBg, ...cardShadow },
            ]}
          >
            <Text
              style={[
                Hierarchy.caption,
                { color: palette.icon ?? palette.text, marginBottom: 6 },
              ]}
            >
              TOTAL AÑADIDO AL EFECTIVO
            </Text>
            <Text
              style={[Hierarchy.valueSecondary, { color: palette.primary }]}
            >
              {totalGrantedUsd.toLocaleString('es-ES', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{' '}
              US$
            </Text>
          </View>

          <View
            style={[styles.sectionRow, { borderLeftColor: palette.primary }]}
          >
            <Text
              style={[
                Hierarchy.titleSection,
                { color: palette.icon ?? palette.text },
              ]}
            >
              DETALLE
            </Text>
          </View>

          <View
            style={[
              styles.listCard,
              { backgroundColor: cardBg, ...cardShadow },
            ]}
          >
            {grants.map((g) => (
              <View key={g.level} style={styles.listRow}>
                <Text style={[Hierarchy.body, { color: palette.text }]}>
                  Nivel {g.level}
                </Text>
                <Text
                  style={[
                    Hierarchy.bodySmallSemibold,
                    { color: palette.primary },
                  ]}
                >
                  +{g.amountUsd.toLocaleString('es-ES')} US$
                </Text>
              </View>
            ))}
          </View>

          <Text
            variant="muted"
            style={[
              Hierarchy.caption,
              {
                color: palette.icon ?? palette.text,
                lineHeight: 20,
                marginBottom: 18,
              },
            ]}
          >
            El dinero ya está en tu efectivo disponible. Úsalo cuando quieras
            desde Cartera.
          </Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: palette.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
              Platform.select({
                ios: {
                  shadowColor: palette.primary,
                  shadowOpacity: pressed ? 0.18 : 0.28,
                  shadowRadius: pressed ? 8 : 12,
                  shadowOffset: { width: 0, height: pressed ? 3 : 5 },
                },
                android: { elevation: pressed ? 3 : 5 },
                web: {
                  boxShadow: pressed
                    ? '0 4px 16px rgba(29, 78, 216, 0.28)'
                    : '0 6px 20px rgba(29, 78, 216, 0.32)',
                },
              }),
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continuar"
          >
            <Text
              style={[
                Hierarchy.action,
                {
                  color: palette.primaryText ?? '#FFF',
                  fontWeight: '600',
                  letterSpacing: 0.2,
                },
              ]}
            >
              Continuar
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </CardModal>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  totalCard: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
  },
  listCard: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    gap: 10,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  cta: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
});
