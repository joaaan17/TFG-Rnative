import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import type { CashTransactionView } from '../../types/cash.types';

const ENTRY_GREEN = '#16A34A';

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const h = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${min}`;
  } catch {
    return iso;
  }
}

function formatAmount(amount: number, currency: string): string {
  const abs = Math.abs(amount);
  const str = abs.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount >= 0 ? '+' : '−';
  return `${sign}${str} ${currency === 'USD' ? '$' : ''}`;
}

function getTitle(item: CashTransactionView): string {
  if (item.type === 'BUY') return `Compra ${item.symbol ?? ''}`.trim();
  if (item.type === 'SELL') return `Venta ${item.symbol ?? ''}`.trim();
  return 'Movimiento';
}

/** Impacto económico neto: para ventas = beneficio/pérdida; para compras = coste. */
function getNetImpact(tx: CashTransactionView): {
  label: string;
  value: string;
  isLoss: boolean;
  isGain: boolean;
} {
  const r = tx.raw;
  if (tx.type === 'BUY') {
    const abs = Math.abs(tx.amount);
    const str = abs.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return {
      label: 'Coste',
      value: `${str} ${tx.currency === 'USD' ? '$' : ''}`,
      isLoss: false,
      isGain: false,
    };
  }
  if (
    tx.type === 'SELL' &&
    r.avgBuyPrice != null &&
    Number.isFinite(r.avgBuyPrice)
  ) {
    const pnl = (r.price - r.avgBuyPrice) * r.shares;
    const isLoss = pnl < 0;
    return {
      label: isLoss ? 'Pérdida' : 'Ganancia',
      value: formatAmount(pnl, tx.currency),
      isLoss,
      isGain: pnl > 0,
    };
  }
  return {
    label: '',
    value: formatAmount(tx.amount, tx.currency),
    isLoss: false,
    isGain: tx.amount > 0,
  };
}

export type DayTransactionsSheetProps = {
  selectedDate: Date;
  transactions: CashTransactionView[];
  onSelectTransaction: (tx: CashTransactionView) => void;
  styles: {
    daySheetWrap: object;
    daySheetHandle: object;
    daySheetTitle: object;
    daySheetCard: object;
    daySheetCardAccent: object;
    daySheetCardBody: object;
    daySheetCardAmount: object;
  };
};

export function DayTransactionsSheet({
  selectedDate,
  transactions,
  onSelectTransaction,
  styles: s,
}: DayTransactionsSheetProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const isToday =
    selectedDate.getDate() === new Date().getDate() &&
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();

  const titleLabel = isToday
    ? 'Hoy'
    : selectedDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
      });

  const sheetBg = palette.cardBackground ?? palette.background;

  return (
    <View
      style={[
        s.daySheetWrap,
        { backgroundColor: sheetBg },
        { paddingBottom: 48 + insets.bottom + 64 },
      ]}
    >
      <View style={[s.daySheetHandle, { backgroundColor: palette.primary }]} />
      <Text
        style={[Hierarchy.titleModal, s.daySheetTitle, { color: palette.text }]}
      >
        {titleLabel}
      </Text>

      {transactions.length === 0 ? (
        <View style={{ paddingVertical: 32 }}>
          <Text
            variant="muted"
            style={[
              Hierarchy.bodySmall,
              { textAlign: 'center', color: palette.icon },
            ]}
          >
            No hay movimientos este día
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ maxHeight: 320 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {transactions.map((tx) => {
            const impact = getNetImpact(tx);
            const amountColor = impact.isLoss
              ? palette.destructive
              : impact.isGain
                ? ENTRY_GREEN
                : tx.type === 'BUY'
                  ? palette.text
                  : ENTRY_GREEN;
            const accentColor = impact.isLoss
              ? palette.destructive
              : impact.isGain
                ? ENTRY_GREEN
                : palette.primary;

            return (
              <Pressable
                key={tx.id}
                onPress={() => onSelectTransaction(tx)}
                style={({ pressed }) => [
                  s.daySheetCard,
                  {
                    backgroundColor:
                      palette.surfaceMuted ?? palette.chartAreaBackground,
                  },
                  pressed && { opacity: 0.9 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Ver detalle: ${getTitle(tx)}`}
              >
                <View
                  style={[
                    s.daySheetCardAccent,
                    { backgroundColor: accentColor },
                  ]}
                />
                <View style={s.daySheetCardBody}>
                  <Text
                    style={[
                      Hierarchy.bodySmallSemibold,
                      { color: palette.text },
                    ]}
                    numberOfLines={1}
                  >
                    {getTitle(tx)}
                  </Text>
                  <Text
                    variant="muted"
                    style={[
                      Hierarchy.caption,
                      { marginTop: 4, color: palette.icon },
                    ]}
                    numberOfLines={1}
                  >
                    {formatTime(tx.createdAt)}
                  </Text>
                </View>
                <View style={s.daySheetCardAmount}>
                  {impact.label ? (
                    <>
                      <Text
                        style={[Hierarchy.caption, { color: palette.icon }]}
                        numberOfLines={1}
                      >
                        {impact.label}
                      </Text>
                      <Text
                        style={[
                          Hierarchy.bodySmallSemibold,
                          { color: amountColor, marginTop: 2 },
                        ]}
                        numberOfLines={1}
                      >
                        {impact.value}
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        Hierarchy.bodySmallSemibold,
                        { color: amountColor },
                      ]}
                      numberOfLines={1}
                    >
                      {impact.value}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
