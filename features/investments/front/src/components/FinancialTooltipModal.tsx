import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import type { Palette } from '@/shared/hooks/use-palette';

export type FinancialTooltipModalProps = {
  visible: boolean;
  title: string;
  description: string;
  palette: Palette;
  onClose: () => void;
};

export function FinancialTooltipModal({
  visible,
  title,
  description,
  palette,
  onClose,
}: FinancialTooltipModalProps) {
  const cardBg = palette.background;
  const borderColor = palette.surfaceBorder ?? palette.surfaceMuted ?? '#e0e0e0';
  const accentColor = palette.primary ?? '#2563eb';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.accent, { backgroundColor: accentColor }]} />
          <Text
            style={[
              Hierarchy.bodySmallSemibold,
              { color: palette.text, marginBottom: 6 },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <ScrollView
            style={styles.descriptionScroll}
            showsVerticalScrollIndicator={description.length > 280}
            nestedScrollEnabled
          >
            <Text
              style={[
                Hierarchy.bodySmall,
                { color: palette.icon ?? palette.text, lineHeight: 22 },
              ]}
            >
              {description}
            </Text>
          </ScrollView>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.dismissBtn,
              { backgroundColor: accentColor, opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <Text style={[Hierarchy.action, { color: palette.primaryText ?? '#FFF' }]}>
              Entendido
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  accent: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  dismissBtn: {
    marginTop: 16,
    alignSelf: 'stretch',
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionScroll: {
    maxHeight: 280,
  },
});
