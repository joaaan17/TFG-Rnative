import React from 'react';
import { View, type ViewStyle, type TextStyle } from 'react-native';

import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import type { CashMonthlySummary } from '../../types/cash.types';

const ENTRY_GREEN = '#16A34A';

export type CashHeaderProps = {
  balance: number;
  currency: string;
  monthly?: CashMonthlySummary;
  styles: {
    header: ViewStyle;
    headerRow: ViewStyle;
    headerTitleWrap: ViewStyle;
    headerTitleAccent: ViewStyle;
    headerLabelWrap: ViewStyle;
    headerTitle: TextStyle;
    headerSubtitle: TextStyle;
    headerBalanceWrap: ViewStyle;
    headerBalance: TextStyle;
    headerVariation: TextStyle;
  };
};

function formatMoney(value: number, currency: string): string {
  return `${value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency === 'USD' ? '$' : currency}`;
}

export function CashHeader({
  balance,
  currency,
  monthly,
  styles: s,
}: CashHeaderProps) {
  const palette = usePalette();
  const variation = monthly
    ? monthly.in - monthly.out - (monthly.fees ?? 0)
    : 0;
  const showVariation = variation !== 0 && monthly;

  return (
    <View style={s.header}>
      <View style={s.headerRow}>
        <View style={s.headerTitleWrap}>
          <View style={s.headerTitleAccent} />
          <Text
            style={[
              Hierarchy.titleSection,
              s.headerTitle,
              { color: palette.icon ?? palette.text },
            ]}
          >
            Efectivo
          </Text>
        </View>
        <View style={s.headerBalanceWrap}>
          <Text
            style={[Hierarchy.value, s.headerBalance, { color: palette.text }]}
            numberOfLines={1}
          >
            {formatMoney(balance, currency)}
          </Text>
          <Text
            variant="muted"
            style={[
              Hierarchy.caption,
              s.headerSubtitle,
              { color: palette.icon, marginTop: 2 },
            ]}
          >
            Disponible
          </Text>
        </View>
      </View>
      {showVariation && (
        <Text
          variant="muted"
          style={[
            Hierarchy.caption,
            s.headerVariation,
            {
              color: variation >= 0 ? ENTRY_GREEN : palette.icon,
            },
          ]}
        >
          {variation >= 0 ? '+' : ''}
          {formatMoney(variation, currency)} este mes
        </Text>
      )}
    </View>
  );
}
