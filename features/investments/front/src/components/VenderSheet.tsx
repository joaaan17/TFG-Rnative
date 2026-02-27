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

export type VenderSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Número de acciones que tiene el usuario en este activo. */
  sharesAvailable: number;
  /** Precio actual del activo. */
  price: number;
  symbol?: string;
  /** Al confirmar venta: (símbolo, número de acciones). */
  onSell?: (symbol: string, shares: number) => Promise<unknown>;
  /** Mientras se ejecuta la orden. */
  sellLoading?: boolean;
  /** Error de la última orden (ej. No tienes suficientes acciones). */
  sellError?: string | null;
  /** Limpiar error al cerrar/abrir. */
  onClearSellError?: () => void;
};

export function VenderSheet({
  visible,
  onClose,
  sharesAvailable,
  price,
  symbol,
  onSell,
  sellLoading = false,
  sellError = null,
  onClearSellError,
}: VenderSheetProps) {
  const palette = usePalette();
  const [sharesStr, setSharesStr] = useState('0');

  useEffect(() => {
    if (visible) {
      setSharesStr('0');
      onClearSellError?.();
    }
  }, [visible, onClearSellError]);

  const sharesNum = parseFloat(sharesStr.replace(',', '.')) || 0;
  const totalProceeds = Math.round(sharesNum * price * 100) / 100;
  const canSell =
    sharesNum > 0 &&
    sharesNum <= sharesAvailable &&
    totalProceeds > 0 &&
    !!symbol;
  const formattedAvailable = sharesAvailable.toLocaleString('es-ES', {
    maximumFractionDigits: 4,
  });
  const formattedPrice = price.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedProceeds = totalProceeds.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handlePlusOne = useCallback(() => {
    setSharesStr((prev) => {
      const n = Math.floor(parseFloat(prev.replace(',', '.')) || 0);
      const next = Math.min(n + 1, sharesAvailable);
      return String(next);
    });
  }, [sharesAvailable]);

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
      const num = parseFloat(next.replace(',', '.')) || 0;
      if (num > sharesAvailable) return prev;
      const parts = next.split(',');
      if (parts[1]?.length > 4) return prev;
      return next;
    });
  }, [sharesAvailable]);

  const handleVender = useCallback(async () => {
    if (!canSell || !symbol || !onSell) return;
    try {
      await onSell(symbol, sharesNum);
      onClose();
    } catch {
      // Error mostrado vía sellError
    }
  }, [canSell, symbol, sharesNum, onSell, onClose]);

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
          title="Vender"
          onBack={onClose}
          onClose={onClose}
          backAccessibilityLabel="Volver atrás"
        />
        <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Text
              variant="muted"
              style={[Hierarchy.bodySmall, { color: palette.icon ?? palette.text }]}
            >
              Tienes {formattedAvailable} {sharesAvailable === 1 ? 'acción' : 'acciones'}
              {symbol ? ` (${symbol})` : ''}
            </Text>
          </View>

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
                disabled={sellLoading || sharesNum <= 0}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed || sellLoading || sharesNum <= 0 ? 0.6 : 1,
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
                disabled={sellLoading || sharesNum >= sharesAvailable}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: pressed || sellLoading || sharesNum >= sharesAvailable ? 0.85 : 1,
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
                Importe a recibir: {formattedProceeds} $
              </Text>
            )}
          </View>

          {sellError ? (
            <View style={{ marginBottom: 12, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: `${palette.destructive ?? '#E5484D'}20` }}>
              <Text style={[Hierarchy.bodySmall, { color: palette.destructive ?? '#E5484D' }]}>
                {sellError}
              </Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            {KEYPAD_KEYS.map((row) =>
              row.map((key) => (
                <Pressable
                  key={key === 'backspace' ? 'back' : key}
                  onPress={() => handleKey(key)}
                  disabled={sellLoading}
                  style={({ pressed }) => ({
                    width: key === '0' ? 72 : 64,
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: palette.surfaceMuted ?? '#EEF2F7',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: pressed || sellLoading ? 0.85 : 1,
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
              onPress={handleVender}
              disabled={!canSell || sellLoading}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: canSell && !sellLoading ? palette.primary : (palette.surfaceMuted ?? '#EEF2F7'),
                opacity: pressed ? 0.85 : 1,
              })}
              accessibilityRole="button"
              accessibilityLabel="Vender"
            >
              {sellLoading ? (
                <ActivityIndicator size="small" color={palette.primaryText ?? '#FFF'} />
              ) : (
                <>
                  <Text
                    style={[
                      Hierarchy.action,
                      {
                        color: canSell && !sellLoading ? (palette.primaryText ?? '#FFF') : palette.text,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    Vender
                  </Text>
                  <ChevronRight
                    size={18}
                    color={canSell && !sellLoading ? palette.primaryText ?? '#FFF' : palette.text}
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
