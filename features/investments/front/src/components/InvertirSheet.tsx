import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { ChevronRight, Minus, Plus } from 'lucide-react-native';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
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
  /** Cash disponible (USD). */
  availableAmount: number;
  /** Precio actual del activo. */
  price: number;
  symbol?: string;
  /** Al confirmar compra: (símbolo, número de acciones). */
  onBuy?: (symbol: string, shares: number) => Promise<unknown>;
  /** Mientras se ejecuta la orden. */
  buyLoading?: boolean;
  /** Error de la última orden (ej. Fondos insuficientes). */
  buyError?: string | null;
  /** Limpiar error al cerrar/abrir. */
  onClearBuyError?: () => void;
};

export function InvertirSheet({
  visible,
  onClose,
  availableAmount,
  price,
  symbol,
  onBuy,
  buyLoading = false,
  buyError = null,
  onClearBuyError,
}: InvertirSheetProps) {
  const palette = usePalette();
  const [sharesStr, setSharesStr] = useState('0');

  useEffect(() => {
    if (visible) {
      setSharesStr('0');
      onClearBuyError?.();
    }
  }, [visible, onClearBuyError]);

  const sharesNum = parseFloat(sharesStr.replace(',', '.')) || 0;
  const totalCost = Math.round(sharesNum * price * 100) / 100;
  const canBuy = sharesNum > 0 && totalCost > 0 && totalCost <= availableAmount && !!symbol;
  const formattedAvailable = availableAmount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedPrice = price.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedCost = totalCost.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handlePlusOne = useCallback(() => {
    setSharesStr((prev) => {
      const n = Math.floor(parseFloat(prev.replace(',', '.')) || 0);
      return String(n + 1);
    });
  }, []);

  const handleMinusOne = useCallback(() => {
    setSharesStr((prev) => {
      const n = Math.floor(parseFloat(prev.replace(',', '.')) || 0);
      const next = Math.max(0, n - 1);
      return String(next);
    });
  }, []);

  const handleKey = useCallback((key: string) => {
    if (key === 'backspace') {
      setSharesStr((prev) => {
        if (prev.length <= 1) return '0';
        const next = prev.slice(0, -1);
        return next === '' ? '0' : next;
      });
      return;
    }
    setSharesStr((prev) => {
      if (prev === '0' && key !== ',') return key;
      if (key === ',' && prev.includes(',')) return prev;
      if (key === ',' && !prev.includes(',')) return prev + ',';
      const next = prev + key;
      const parts = next.split(',');
      if (parts[1]?.length > 4) return prev;
      return next;
    });
  }, []);

  const handleComprar = useCallback(async () => {
    if (!canBuy || !symbol || !onBuy) return;
    try {
      await onBuy(symbol, sharesNum);
      onClose();
    } catch {
      // Error mostrado vía buyError
    }
  }, [canBuy, symbol, sharesNum, onBuy, onClose]);

  if (!visible) return null;

  return (
    <CardModal
      open={visible}
      onClose={onClose}
      maxHeightPct={0.92}
      closeOnBackdropPress
      scrollable={false}
      contentNoPaddingTop
    >
      <View style={{ flex: 1, minHeight: 0 }}>
        <ModalHeader
          title="Invertir"
          onBack={onClose}
          onClose={onClose}
          backAccessibilityLabel="Volver atrás"
        />
        <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 24 }}>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Disponible"
          >
            <Text
              variant="muted"
              style={[Hierarchy.bodySmall, { color: palette.icon ?? palette.text }]}
            >
              {formattedAvailable} $ disponible
            </Text>
            <ChevronRight size={18} color={palette.icon ?? palette.text} style={{ marginLeft: 4 }} />
          </Pressable>

          <View style={{ alignItems: 'center', marginTop: 28, marginBottom: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <Pressable
                onPress={handleMinusOne}
                disabled={buyLoading || sharesNum <= 0}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed || buyLoading || sharesNum <= 0 ? 0.6 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel="Quitar una acción"
              >
                <Minus
                  size={24}
                  color={sharesNum <= 0 ? palette.icon ?? palette.text : palette.primary}
                  strokeWidth={2.5}
                />
              </Pressable>
              <Text
                style={[Hierarchy.value, { color: palette.text, fontSize: 32, minWidth: 120, textAlign: 'center' }]}
              >
                {sharesStr} {sharesNum === 1 ? 'acción' : 'acciones'}
              </Text>
              <Pressable
                onPress={handlePlusOne}
                disabled={buyLoading}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed || buyLoading ? 0.85 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel="Añadir una acción"
              >
                <Plus
                  size={24}
                  color={palette.primary}
                  strokeWidth={2.5}
                />
              </Pressable>
            </View>
            <Text
              variant="muted"
              style={[Hierarchy.bodySmall, { marginTop: 8, color: palette.icon }]}
            >
              Precio: {formattedPrice} ${symbol ? ` · ${symbol}` : ''}
            </Text>
            {sharesNum > 0 && (
              <Text
                variant="muted"
                style={[Hierarchy.bodySmall, { marginTop: 4, color: palette.primary }]}
              >
                Coste total: {formattedCost} $
              </Text>
            )}
          </View>

          {buyError ? (
            <View style={{ marginBottom: 12, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: `${palette.destructive ?? '#E5484D'}20` }}>
              <Text style={[Hierarchy.bodySmall, { color: palette.destructive ?? '#E5484D' }]}>
                {buyError}
              </Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            {KEYPAD_KEYS.map((row) =>
              row.map((key) => (
                <Pressable
                  key={key === 'backspace' ? 'back' : key}
                  onPress={() => handleKey(key)}
                  disabled={buyLoading}
                  style={({ pressed }) => ({
                    width: key === '0' ? 72 : 64,
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: pressed || buyLoading ? 0.85 : 1,
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

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }}>
            <Text style={[Hierarchy.captionSmall, { color: palette.icon }]}>
              Acciones
            </Text>
            <Pressable
              onPress={handleComprar}
              disabled={!canBuy || buyLoading}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: canBuy && !buyLoading ? palette.primary : (palette.surfaceMuted ?? '#EEF2F7'),
                opacity: pressed ? 0.85 : 1,
              })}
              accessibilityRole="button"
              accessibilityLabel="Comprar"
            >
              {buyLoading ? (
                <ActivityIndicator size="small" color={palette.primaryText ?? '#FFF'} />
              ) : (
                <>
                  <Text
                    style={[
                      Hierarchy.action,
                      {
                        color: canBuy && !buyLoading ? (palette.primaryText ?? '#FFF') : palette.text,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    Comprar
                  </Text>
                  <ChevronRight
                    size={18}
                    color={canBuy && !buyLoading ? palette.primaryText ?? '#FFF' : palette.text}
                    style={{ marginLeft: 4 }}
                  />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </CardModal>
  );
}
