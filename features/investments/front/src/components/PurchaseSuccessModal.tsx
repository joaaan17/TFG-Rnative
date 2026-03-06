import React from 'react';
import { View, Pressable } from 'react-native';
import { CheckCircle2, ChevronRight } from 'lucide-react-native';
import { CardModal } from '@/shared/components/card-modal';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';

export type PurchaseSuccessModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Al pulsar "Ir a Inversiones": cerrar este modal y ejecutar (p. ej. refetch + cerrar modal padre). */
  onGoToMain: () => void;
};

/**
 * Modal de confirmación tras una compra exitosa.
 * Muestra mensaje de éxito y botón para ir a la pestaña principal y ver la cartera actualizada.
 */
export function PurchaseSuccessModal({
  visible,
  onClose,
  onGoToMain,
}: PurchaseSuccessModalProps) {
  const palette = usePalette();

  const handleGoToMain = () => {
    onClose();
    onGoToMain();
  };

  return (
    <CardModal
      open={visible}
      onClose={onClose}
      maxHeightPct={0.5}
      closeOnBackdropPress={false}
      scrollable={false}
      contentNoPaddingTop
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingVertical: 32,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: `${palette.primary}20`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <CheckCircle2 size={44} color={palette.primary} strokeWidth={2} />
        </View>
        <Text
          style={[
            Hierarchy.titleModal,
            { color: palette.text, textAlign: 'center', marginBottom: 8 },
          ]}
        >
          ¡Compra realizada!
        </Text>
        <Text
          variant="muted"
          style={[
            Hierarchy.bodySmall,
            {
              color: palette.icon ?? palette.text,
              textAlign: 'center',
              marginBottom: 28,
            },
          ]}
        >
          Tu compra se ha efectuado correctamente. Verás tus acciones
          actualizadas en tu cartera.
        </Text>
        <Pressable
          onPress={handleGoToMain}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 12,
            backgroundColor: palette.primary,
            opacity: pressed ? 0.9 : 1,
            minWidth: 220,
          })}
          accessibilityRole="button"
          accessibilityLabel="Ir a Inversiones"
        >
          <Text
            style={[
              Hierarchy.action,
              { color: palette.primaryText ?? '#FFF', fontWeight: '600' },
            ]}
          >
            Ir a Inversiones
          </Text>
          <ChevronRight
            size={20}
            color={palette.primaryText ?? '#FFF'}
            style={{ marginLeft: 6 }}
          />
        </Pressable>
      </View>
    </CardModal>
  );
}
