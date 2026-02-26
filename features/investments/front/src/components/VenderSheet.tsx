import React from 'react';
import { Pressable, View } from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';

const PERCENT_OPTIONS = [
  { value: 25, label: '25 %' },
  { value: 50, label: '50 %' },
  { value: 100, label: '100 %' },
];

export type VenderSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Importe disponible (ej. posición total). */
  amountAvailable: number;
  /** Símbolo del activo (opcional, para contexto). */
  symbol?: string;
  onSelectPercent?: (percent: 25 | 50 | 100) => void;
  onCustomAmount?: () => void;
};

export function VenderSheet({
  visible,
  onClose,
  amountAvailable,
  symbol,
  onSelectPercent,
  onCustomAmount,
}: VenderSheetProps) {
  const palette = usePalette();
  const formattedAmount = amountAvailable.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <CardModal
      open={visible}
      onClose={onClose}
      maxHeightPct={0.45}
      closeOnBackdropPress
      scrollable={false}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
        <Text
          style={[Hierarchy.titleModal, { color: palette.text }]}
        >
          Vender
        </Text>
        <Text
          variant="muted"
          style={[Hierarchy.bodySmall, { marginTop: 6, color: palette.icon ?? palette.text }]}
        >
          Tienes {formattedAmount} €{symbol ? ` (${symbol})` : ''}
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
          {PERCENT_OPTIONS.slice(0, 2).map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => onSelectPercent?.(opt.value as 25 | 50 | 100)}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 52,
                borderRadius: 14,
                backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                borderWidth: 1,
                borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
              accessibilityRole="button"
              accessibilityLabel={`Vender ${opt.label}`}
            >
              <Text style={[Hierarchy.action, { color: palette.text, fontWeight: '600' }]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Pressable
            onPress={() => onSelectPercent?.(100)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 52,
              borderRadius: 14,
              backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
              borderWidth: 1,
              borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Vender 100%"
          >
            <Text style={[Hierarchy.action, { color: palette.text, fontWeight: '600' }]}>
              100 %
            </Text>
          </Pressable>
          <Pressable
            onPress={onCustomAmount}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 52,
              borderRadius: 14,
              backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
              borderWidth: 1,
              borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Importe personalizado"
          >
            <Text style={[Hierarchy.action, { color: palette.text, fontWeight: '600' }]}>
              ...
            </Text>
          </Pressable>
        </View>
      </View>
    </CardModal>
  );
}
