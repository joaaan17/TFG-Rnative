import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { GusPortraitFrame } from '@/shared/components/GusPortraitFrame';
import { ModalHeader } from '@/shared/components/modal-header';
import { Text } from '@/shared/components/ui/text';
import { ACHIEVEMENT_LEVEL_CASH_USD } from '@/shared/constants/achievements';
import { getAchievementInvestmentTip } from '@/shared/constants/achievement-investment-tips';
import { MASCOT_INVESTOR_DIALOGUES } from '@/shared/data/mascot-investor-dialogues';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';

export type AchievementRewardModalProps = {
  open: boolean;
  onClose: () => void;
  grants: { level: number; amountUsd: number }[];
  totalGrantedUsd: number;
};

/**
 * Modal al desbloquear logros de nivel: Guspresario entrega el premio en efectivo
 * y un consejo de inversión por cada hito desbloqueado.
 */
export function AchievementRewardModal({
  open,
  onClose,
  grants,
  totalGrantedUsd,
}: AchievementRewardModalProps) {
  const palette = usePalette();

  const mascot = MASCOT_INVESTOR_DIALOGUES.mascot;

  const sortedGrants = React.useMemo(
    () => [...grants].sort((a, b) => a.level - b.level),
    [grants],
  );

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

  const title = `¡${mascot} te entrega tu premio!`;
  const subtitle =
    sortedGrants.length === 1
      ? `Logro desbloqueado al alcanzar el nivel ${sortedGrants[0].level}`
      : `${sortedGrants.length} logros desbloqueados de golpe`;

  const formattedTotal = totalGrantedUsd.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.99}
      closeOnBackdropPress
      scrollable
      contentNoPaddingTop
      contentBackgroundColor={palette.cardBackground}
    >
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled
        contentContainerStyle={styles.scrollContent}
      >
        <ModalHeader
          title={title}
          subtitle={subtitle}
          titleNumberOfLines={3}
          subtitleNumberOfLines={3}
          onClose={onClose}
          closeAccessibilityLabel="Cerrar"
        />
        <View style={styles.content}>
          <GusPortraitFrame
            variant="large"
            style={{ marginBottom: 20 }}
            accessibilityLabel={`${mascot} te entrega la recompensa`}
          />

          <View
            style={[
              styles.prizeCard,
              { backgroundColor: cardBg, ...cardShadow },
            ]}
          >
            <Text
              style={[
                Hierarchy.caption,
                { color: palette.icon ?? palette.text, marginBottom: 8 },
              ]}
            >
              ACABAS DE GANAR
            </Text>
            <Text
              style={[Hierarchy.valueSecondary, { color: palette.primary }]}
            >
              +{formattedTotal} US$
            </Text>
            <Text
              style={[
                Hierarchy.body,
                {
                  color: palette.text,
                  textAlign: 'center',
                  marginTop: 14,
                  lineHeight: 22,
                },
              ]}
            >
              Ese importe{' '}
              <Text style={{ fontWeight: '600' }}>
                ya está depositado en tu cartera
              </Text>{' '}
              como efectivo disponible. Puedes invertirlo cuando quieras desde
              Cartera.
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
              CONSEJO DE {mascot.toUpperCase()}
            </Text>
          </View>

          {sortedGrants.map((g) => (
            <View
              key={g.level}
              style={[
                styles.tipCard,
                { backgroundColor: cardBg, ...cardShadow },
              ]}
            >
              <View style={styles.tipBadgeRow}>
                <Text
                  style={[
                    Hierarchy.bodySmallSemibold,
                    { color: palette.primary },
                  ]}
                >
                  Nivel {g.level}
                </Text>
                <Text
                  variant="muted"
                  style={[Hierarchy.caption, { marginLeft: 8 }]}
                >
                  +{g.amountUsd.toLocaleString('es-ES')} US$
                </Text>
              </View>
              <Text
                style={[
                  Hierarchy.body,
                  {
                    color: palette.text,
                    lineHeight: 22,
                    marginTop: 10,
                    fontStyle: 'italic',
                  },
                ]}
              >
                “{getAchievementInvestmentTip(g.level)}”
              </Text>
            </View>
          ))}

          <Text
            variant="muted"
            style={[
              Hierarchy.caption,
              {
                color: palette.icon ?? palette.text,
                lineHeight: 20,
                marginTop: 8,
                marginBottom: 18,
              },
            ]}
          >
            Cada logro de nivel suma {ACHIEVEMENT_LEVEL_CASH_USD.toLocaleString('es-ES')}{' '}
            US$ a tu efectivo. Sigue sumando XP: el siguiente consejo ya está
            escrito para ti.
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
  prizeCard: {
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
  },
  tipCard: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tipBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
