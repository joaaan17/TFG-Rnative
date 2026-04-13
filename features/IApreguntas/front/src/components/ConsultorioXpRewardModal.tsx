import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import ExpIcon from '@/shared/icons/exp.svg';

export type ConsultorioXpRewardModalProps = {
  visible: boolean;
  onClose: () => void;
  xpAwarded: number;
  remainingToday: number;
};

export function ConsultorioXpRewardModal({
  visible,
  onClose,
  xpAwarded,
  remainingToday,
}: ConsultorioXpRewardModalProps) {
  const palette = usePalette();

  const scale = React.useRef(new Animated.Value(0.6)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!visible) return;
    scale.setValue(0.6);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 12,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, scale, opacity]);

  const cardBg =
    palette.background === '#070B14' || palette.background?.startsWith('#0')
      ? palette.surfaceMuted ?? '#1B2A45'
      : palette.surfaceMuted ?? '#EEF2F7';

  const cardShadow = Platform.select({
    android: { elevation: 1 },
    web: { boxShadow: '0 1px 2px rgba(11, 18, 32, 0.06)' as unknown as undefined },
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
      maxHeightPct={0.65}
      closeOnBackdropPress
      scrollable={false}
      contentNoPaddingTop
      contentBackgroundColor={palette.cardBackground}
    >
      <ModalHeader
        title="¡Recompensa obtenida!"
        onClose={onClose}
        closeAccessibilityLabel="Cerrar"
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconCircle,
            { backgroundColor: `${palette.primary}18`, transform: [{ scale }], opacity },
          ]}
        >
          <Sparkles size={38} color={palette.primary} strokeWidth={1.8} />
        </Animated.View>

        <View style={[styles.sectionRow, { borderLeftColor: palette.primary }]}>
          <Text
            style={[Hierarchy.titleSection, { color: palette.icon ?? palette.text }]}
          >
            EXPERIENCIA GANADA
          </Text>
        </View>

        <View style={[styles.xpCard, { backgroundColor: cardBg, ...cardShadow }]}>
          <View style={styles.xpValueRow}>
            <ExpIcon width={24} height={24} fill={palette.primary} />
            <Text style={[Hierarchy.value, { color: palette.primary, marginLeft: 8 }]}>
              +{xpAwarded.toLocaleString('es-ES')} XP
            </Text>
          </View>
          <Text
            variant="muted"
            style={[Hierarchy.caption, { color: palette.icon ?? palette.text, marginTop: 6 }]}
          >
            Por consultar al asistente financiero
          </Text>
        </View>

        <View style={[styles.sectionRow, { borderLeftColor: palette.primary }]}>
          <Text
            style={[Hierarchy.titleSection, { color: palette.icon ?? palette.text }]}
          >
            PREGUNTAS RESTANTES HOY
          </Text>
        </View>

        <View style={[styles.remainingCard, { backgroundColor: cardBg, ...cardShadow }]}>
          <Text style={[Hierarchy.valueSecondary, { color: palette.text }]}>
            {remainingToday}
          </Text>
          <Text
            variant="muted"
            style={[Hierarchy.caption, { color: palette.icon ?? palette.text, marginTop: 4 }]}
          >
            {remainingToday === 0
              ? 'Has usado todas las preguntas de hoy'
              : remainingToday === 1
                ? 'Te queda 1 pregunta más hoy'
                : `Puedes hacer ${remainingToday} preguntas más hoy`}
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
            style={[Hierarchy.action, { color: palette.primaryText ?? '#FFF', fontWeight: '600' }]}
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
  /** Un solo círculo suave (antes había dos anidados que parecían “doble halo”). */
  iconCircle: {
    alignSelf: 'center',
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
  },
  xpCard: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  xpValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingCard: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
