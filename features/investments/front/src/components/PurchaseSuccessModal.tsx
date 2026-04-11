import React from 'react';
import { View, Pressable } from 'react-native';
import { CheckCircle2, ChevronRight, X } from 'lucide-react-native';
import { CardModal } from '@/shared/components/card-modal';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';

export type PurchaseSuccessModalProps = {
  visible: boolean;
  onClose: () => void;
  /** Al pulsar "Ir a Inversiones": cerrar este modal y ejecutar (p. ej. refetch + cerrar modal padre). */
  onGoToMain: () => void;
  /** XP otorgado por la compra (ej. 50). Si existe, se muestra "+N XP". */
  xpAwarded?: number | null;
};

/**
 * Modal de confirmación tras una compra exitosa.
 * Muestra mensaje de éxito y botón para ir a la pestaña principal y ver la cartera actualizada.
 */
export function PurchaseSuccessModal({
  visible,
  onClose,
  onGoToMain,
  xpAwarded,
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
      maxHeightPct={0.72}
      closeOnBackdropPress={false}
      scrollable={false}
      contentNoPaddingTop
    >
      {/* Botón de cierre en la esquina superior derecha */}
      <View
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={({ pressed }) => ({
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: palette.surfaceBorder
              ? `${palette.surfaceBorder}40`
              : 'rgba(128,128,128,0.15)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <X size={16} color={palette.icon ?? palette.text} strokeWidth={2.5} />
        </Pressable>
      </View>
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 24,
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
            marginBottom: 16,
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
        {xpAwarded != null && xpAwarded > 0 ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: `${palette.positive ?? '#16A34A'}18`,
            }}
          >
            <Text
              style={[
                Hierarchy.bodySmallSemibold,
                { color: palette.positive ?? '#16A34A' },
              ]}
            >
              +{xpAwarded} XP
            </Text>
          </View>
        ) : null}
        <Text
          variant="muted"
          style={[
            Hierarchy.bodySmall,
            {
              color: palette.icon ?? palette.text,
              textAlign: 'center',
              marginBottom: 20,
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
