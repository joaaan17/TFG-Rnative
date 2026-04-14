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
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';

export type LevelUpModalProps = {
  visible: boolean;
  onClose: () => void;
  newLevel: number;
  newTotalXp: number;
  /** Nombre del usuario (sesión); mejora el saludo y el mensaje de ánimo. */
  userName?: string;
};

function firstNameFromDisplay(name: string | undefined): string {
  const t = name?.trim();
  if (!t) return '';
  return t.split(/\s+/)[0] ?? t;
}

/**
 * Modal de felicitación cuando el usuario sube de nivel.
 * Estética alineada con la app: secciones tipo TU POSICIÓN, cards grises, azul primario.
 */
export function LevelUpModal({
  visible,
  onClose,
  newLevel,
  newTotalXp,
  userName,
}: LevelUpModalProps) {
  const palette = usePalette();

  const firstName = firstNameFromDisplay(userName);

  const headerTitle = firstName
    ? `¡${firstName}, has subido de nivel!`
    : '¡Has subido de nivel!';
  const headerSubtitle = 'Tu constancia con el aprendizaje marca la diferencia';
  const encouragementBody = firstName
    ? `${firstName}, cada XP refuerza lo que vas dominando y te acerca al siguiente reto. Usa el consultorio, los tests y la cartera práctica: vas por el camino correcto.`
    : 'Cada XP refuerza lo que vas dominando y te acerca al siguiente reto. Sigue practicando en la app: la constancia es la que suma.';

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

  return (
    <CardModal
      open={visible}
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
          title={headerTitle}
          subtitle={headerSubtitle}
          titleNumberOfLines={3}
          subtitleNumberOfLines={3}
          onClose={onClose}
          closeAccessibilityLabel="Cerrar"
        />
        <View style={styles.content}>
          <GusPortraitFrame
            variant="large"
            style={{ marginBottom: 20 }}
            accessibilityLabel="Guspresario celebra tu nuevo nivel"
          />

          <View
            style={[styles.sectionRow, { borderLeftColor: palette.primary }]}
          >
            <Text
              style={[
                Hierarchy.titleSection,
                { color: palette.icon ?? palette.text },
              ]}
            >
              NUEVO NIVEL
            </Text>
          </View>

          <View
            style={[
              styles.levelCard,
              { backgroundColor: cardBg, ...cardShadow },
            ]}
          >
            <Text style={[Hierarchy.value, { color: palette.text }]}>
              {newLevel}
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
              XP ACUMULADOS
            </Text>
          </View>

          <View
            style={[styles.xpCard, { backgroundColor: cardBg, ...cardShadow }]}
          >
            <Text style={[Hierarchy.valueSecondary, { color: palette.text }]}>
              {newTotalXp.toLocaleString('es-ES')} XP
            </Text>
            <Text
              variant="muted"
              style={[
                Hierarchy.caption,
                {
                  color: palette.icon ?? palette.text,
                  marginTop: 8,
                  textAlign: 'center',
                  lineHeight: 20,
                },
              ]}
            >
              {encouragementBody}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.ctaButton,
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
                android: {
                  elevation: pressed ? 3 : 5,
                },
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
  },
  levelCard: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  xpCard: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
});
