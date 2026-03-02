import React from 'react';
import { Pressable, View } from 'react-native';
import { ShoppingBag, TrendingUp } from 'lucide-react-native';

import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import type { CashTransactionView } from '../../types/cash.types';

const ENTRY_GREEN = '#16A34A';

export type TransactionItemProps = {
  item: CashTransactionView;
  onPress: () => void;
  styles: {
    itemWrap: object;
    itemIconWrap: object;
    itemBody: object;
    itemAmount: object;
  };
};

function formatDateHour(iso: string): string {
  try {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const h = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} ${h}:${min}`;
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

export function TransactionItem({ item, onPress, styles: s }: TransactionItemProps) {
  const palette = usePalette();
  const isEntry = item.amount > 0;
  const amountColor = isEntry
    ? ENTRY_GREEN
    : item.amount < 0
      ? palette.destructive
      : palette.text;

  const Icon = item.type === 'BUY' ? ShoppingBag : TrendingUp;
  const iconBg = item.type === 'BUY'
    ? (palette.primary + '18')
    : (ENTRY_GREEN + '18');
  const iconColor = item.type === 'BUY' ? palette.primary : ENTRY_GREEN;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle: ${getTitle(item)}`}
    >
      <View style={[s.itemWrap, { borderBottomColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.06)' }]}>
        <View style={[s.itemIconWrap, { backgroundColor: iconBg }]}>
          <Icon size={22} color={iconColor} strokeWidth={2} />
        </View>
        <View style={s.itemBody}>
          <Text
            style={[Hierarchy.bodySmallSemibold, { color: palette.text }]}
            numberOfLines={1}
          >
            {getTitle(item)}
          </Text>
          <Text
            variant="muted"
            style={[Hierarchy.caption, { marginTop: 2, color: palette.icon }]}
            numberOfLines={1}
          >
            {formatDateHour(item.createdAt)}
          </Text>
        </View>
        <View style={s.itemAmount}>
          <Text
            style={[
              Hierarchy.bodySmallSemibold,
              { color: amountColor },
            ]}
            numberOfLines={1}
          >
            {formatAmount(item.amount, item.currency)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
