import React from 'react';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';

const LEVEL_UP_IMAGE = require('@/shared/gus-images/Gemini_Generated_Image_9kyg439kyg439kyg-removebg-preview.png');

export type LevelUpModalProps = {
  visible: boolean;
  onClose: () => void;
  newLevel: number;
  newTotalXp: number;
};

/**
 * Modal de felicitación cuando el usuario sube de nivel.
 * Estética alineada con la app: secciones tipo TU POSICIÓN, cards grises, azul primario.
 */
export function LevelUpModal({
  visible,
  onClose,
  newLevel,
  newTotalXp,
}: LevelUpModalProps) {
  const palette = usePalette();

  const cardBg =
    palette.background === '#070B14' || palette.background?.startsWith('#0')
      ? palette.surfaceMuted ?? '#1B2A45'
      : palette.surfaceMuted ?? '#EEF2F7';

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
      maxHeightPct={0.75}
      closeOnBackdropPress
      scrollable={false}
      contentNoPaddingTop
      contentBackgroundColor={palette.cardBackground}
    >
      <ModalHeader
        title="¡Has subido de nivel!"
        onClose={onClose}
        closeAccessibilityLabel="Cerrar"
      />
      <View style={styles.content}>
        <View style={[styles.imageWrap, { backgroundColor: `${palette.primary}08` }]}>
          <Image
            source={LEVEL_UP_IMAGE}
            style={styles.image}
            contentFit="contain"
          />
        </View>

        <View style={[styles.sectionRow, { borderLeftColor: palette.primary }]}>
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

        <View style={[styles.sectionRow, { borderLeftColor: palette.primary }]}>
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
          style={[
            styles.xpCard,
            { backgroundColor: cardBg, ...cardShadow },
          ]}
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
                marginTop: 4,
              },
            ]}
          >
            Sigue así para alcanzar el siguiente nivel
          </Text>
        </View>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.ctaButton,
            {
              backgroundColor: palette.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continuar"
        >
          <Text
            style={[
              Hierarchy.action,
              { color: palette.primaryText ?? '#FFF', fontWeight: '600' },
            ]}
          >
            Continuar
          </Text>
        </Pressable>
      </View>
    </CardModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  imageWrap: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 120,
    height: 120,
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
