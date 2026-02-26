import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { CardModal } from '@/shared/components/card-modal';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';

const KEYPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0', 'backspace'],
];

export type InvertirSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Importe disponible para invertir. */
  availableAmount: number;
  /** Precio actual del activo. */
  price: number;
  symbol?: string;
  onNext?: (amount: number) => void;
};

export function InvertirSheet({
  visible,
  onClose,
  availableAmount,
  price,
  symbol,
  onNext,
}: InvertirSheetProps) {
  const palette = usePalette();
  const [amountStr, setAmountStr] = useState('0');

  useEffect(() => {
    if (visible) setAmountStr('0');
  }, [visible]);

  const amountNum = parseFloat(amountStr.replace(',', '.')) || 0;
  const formattedAvailable = availableAmount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedPrice = price.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleKey = useCallback((key: string) => {
    if (key === 'backspace') {
      setAmountStr((prev) => {
        if (prev.length <= 1) return '0';
        const next = prev.slice(0, -1);
        return next === '' ? '0' : next;
      });
      return;
    }
    setAmountStr((prev) => {
      if (prev === '0' && key !== ',') return key;
      if (key === ',' && prev.includes(',')) return prev;
      if (key === ',' && !prev.includes(',')) return prev + ',';
      const next = prev + key;
      const parts = next.split(',');
      if (parts[1]?.length > 2) return prev;
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    onNext?.(amountNum);
    onClose();
  }, [amountNum, onNext, onClose]);

  if (!visible) return null;

  return (
    <CardModal
      open={visible}
      onClose={onClose}
      maxHeightPct={0.92}
      closeOnBackdropPress
      scrollable={false}
    >
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}>
        <Text
          style={[Hierarchy.titleModal, { color: palette.text }]}
        >
          Invertir
        </Text>
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Disponible"
        >
          <Text
            variant="muted"
            style={[Hierarchy.bodySmall, { color: palette.icon ?? palette.text }]}
          >
            {formattedAvailable} € disponible
          </Text>
          <ChevronRight size={18} color={palette.icon ?? palette.text} style={{ marginLeft: 4 }} />
        </Pressable>

        <View style={{ alignItems: 'center', marginTop: 28, marginBottom: 16 }}>
          <Text
            style={[
              Hierarchy.value,
              { color: palette.text, fontSize: 32 },
            ]}
          >
            {amountStr} €
          </Text>
          <Text
            variant="muted"
            style={[Hierarchy.bodySmall, { marginTop: 8, color: palette.icon }]}
          >
            Precio: {formattedPrice} €{symbol ? ` · ${symbol}` : ''}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          {KEYPAD_KEYS.map((row, rowIndex) =>
            row.map((key) => (
              <Pressable
                key={key === 'backspace' ? 'back' : key}
                onPress={() => handleKey(key)}
                style={({ pressed }) => ({
                  width: key === '0' ? 72 : 64,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel={key === 'backspace' ? 'Borrar' : key}
              >
                {key === 'backspace' ? (
                  <Text style={[Hierarchy.action, { color: palette.text }]}>←</Text>
                ) : (
                  <Text style={[Hierarchy.action, { color: palette.text, fontWeight: '600' }]}>
                    {key}
                  </Text>
                )}
              </Pressable>
            )),
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[Hierarchy.action, { color: palette.text }]}>Importe</Text>
            <Text style={[Hierarchy.captionSmall, { color: palette.icon, marginLeft: 4 }]}>⌄</Text>
          </View>
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
              borderWidth: 1,
              borderColor: palette.surfaceBorder ?? palette.surfaceMuted,
              opacity: pressed ? 0.85 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Siguiente"
          >
            <Text style={[Hierarchy.action, { color: palette.primary, fontWeight: '600' }]}>
              Siguiente
            </Text>
            <ChevronRight size={18} color={palette.primary} style={{ marginLeft: 4 }} />
          </Pressable>
        </View>
      </View>
    </CardModal>
  );
}
