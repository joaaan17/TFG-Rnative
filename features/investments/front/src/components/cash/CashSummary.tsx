import React from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import type { CashMonthlySummary } from '../../types/cash.types';

const ENTRY_GREEN = '#16A34A';

export type CashSummaryProps = {
  monthly: CashMonthlySummary;
  styles: {
    summary: object;
    summaryRow: object;
    summaryRowLast: object;
    summaryBarWrap: object;
  };
};

function formatShort(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} $`;
}

export function CashSummary({ monthly, styles: s }: CashSummaryProps) {
  const palette = usePalette();
  const total = monthly.in + monthly.out + monthly.fees;
  const inPct = total > 0 ? monthly.in / total : 0;
  const outPct = total > 0 ? monthly.out / total : 0;
  const feesPct = total > 0 ? monthly.fees / total : 0;

  return (
    <View style={s.summary}>
      <View style={s.summaryRow}>
        <Text style={[Hierarchy.caption, { color: palette.icon }]}>
          Entradas este mes
        </Text>
        <Text style={[Hierarchy.bodySmallSemibold, { color: ENTRY_GREEN }]}>
          {formatShort(monthly.in)}
        </Text>
      </View>
      <View style={s.summaryRow}>
        <Text style={[Hierarchy.caption, { color: palette.icon }]}>
          Salidas este mes
        </Text>
        <Text style={[Hierarchy.bodySmallSemibold, { color: palette.text }]}>
          {formatShort(-monthly.out)}
        </Text>
      </View>
      {monthly.fees > 0 && (
        <View style={[s.summaryRow, s.summaryRowLast]}>
          <Text style={[Hierarchy.caption, { color: palette.icon }]}>
            Comisiones
          </Text>
          <Text style={[Hierarchy.bodySmallSemibold, { color: palette.destructive }]}>
            {formatShort(-monthly.fees)}
          </Text>
        </View>
      )}
      {(inPct > 0 || outPct > 0 || feesPct > 0) && (
        <View style={s.summaryBarWrap}>
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${inPct * 100}%`,
              backgroundColor: ENTRY_GREEN,
              borderRadius: 2,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: `${inPct * 100}%`,
              top: 0,
              bottom: 0,
              width: `${outPct * 100}%`,
              backgroundColor: palette.icon,
              borderRadius: 2,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: `${(inPct + outPct) * 100}%`,
              top: 0,
              bottom: 0,
              width: `${feesPct * 100}%`,
              backgroundColor: palette.destructive,
              borderRadius: 2,
            }}
          />
        </View>
      )}
    </View>
  );
}
