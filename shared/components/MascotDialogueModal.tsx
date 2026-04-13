import React from 'react';
import { Image } from 'expo-image';
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
import type { MascotDialogueBucket } from '@/shared/data/mascot-investor-dialogues';

const MASCOT_IMAGE = require('@/shared/gus-images/Gemini_Generated_Image_9kyg439kyg439kyg-removebg-preview.png');

export type MascotDialogueModalProps = {
  open: boolean;
  onClose: () => void;
  mascotName: string;
  bucket: MascotDialogueBucket;
  message: string;
  objective: string;
};

const BUCKET_SUBTITLE: Record<MascotDialogueBucket, string> = {
  '0_minutes': 'Bienvenida al hábito',
  '5_minutes': 'Tu tiempo suma',
  '15_minutes': 'Disciplina que marca',
};

/**
 * Modal alineado con LevelUp: CardModal, ModalHeader, imagen y cuerpo legible.
 */
export function MascotDialogueModal({
  open,
  onClose,
  mascotName,
  bucket,
  message,
  objective,
}: MascotDialogueModalProps) {
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

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.92}
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
          title={mascotName}
          subtitle={BUCKET_SUBTITLE[bucket]}
          titleNumberOfLines={2}
          subtitleNumberOfLines={2}
          onClose={onClose}
          closeAccessibilityLabel="Cerrar"
        />
        <View style={styles.content}>
          <View
            style={[
              styles.imageWrap,
              { backgroundColor: `${palette.primary}10` },
            ]}
          >
            <Image
              source={MASCOT_IMAGE}
              style={styles.image}
              contentFit="contain"
            />
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
              OBJETIVO DEL MOMENTO
            </Text>
          </View>

          <View
            style={[
              styles.copyCard,
              { backgroundColor: cardBg, ...cardShadow },
            ]}
          >
            <Text
              variant="muted"
              style={[
                Hierarchy.caption,
                {
                  color: palette.primary,
                  marginBottom: 12,
                  lineHeight: 18,
                },
              ]}
            >
              {objective}
            </Text>
            <Text
              style={[
                Hierarchy.body,
                {
                  color: palette.text,
                  lineHeight: 24,
                },
              ]}
            >
              {message}
            </Text>
          </View>

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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  imageWrap: {
    alignSelf: 'center',
    width: 132,
    height: 132,
    borderRadius: 66,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 112,
    height: 112,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
  },
  copyCard: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 22,
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
