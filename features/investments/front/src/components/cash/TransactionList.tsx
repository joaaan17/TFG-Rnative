import React from 'react';
import { View } from 'react-native';

import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';

import type { CashTransactionGroup } from '../../types/cash.types';
import type { CashTransactionView } from '../../types/cash.types';
import { TransactionItem } from './TransactionItem';

export type TransactionListProps = {
  groups: CashTransactionGroup[];
  onSelectTransaction: (tx: CashTransactionView) => void;
  styles: {
    sectionTitle: object;
    transactionList: object;
    group: object;
    groupLabel: object;
    itemWrap: object;
    itemIconWrap: object;
    itemBody: object;
    itemAmount: object;
  };
};

export function TransactionList({
  groups,
  onSelectTransaction,
  styles: s,
}: TransactionListProps) {
  const palette = usePalette();

  if (!groups.length) {
    return (
      <View style={{ paddingVertical: 32, paddingHorizontal: 0 }}>
        <Text
          variant="muted"
          style={[Hierarchy.bodySmall, { textAlign: 'center', color: palette.icon }]}
        >
          No hay movimientos de efectivo
        </Text>
      </View>
    );
  }

  return (
    <View style={s.transactionList}>
      <Text
        style={[
          Hierarchy.titleSection,
          s.sectionTitle,
          { color: palette.icon ?? palette.text },
        ]}
      >
        Historial
      </Text>
      {groups.map((group) => (
        <View key={group.label} style={s.group}>
          <Text
            variant="muted"
            style={[Hierarchy.caption, s.groupLabel, { color: palette.icon }]}
          >
            {group.label}
          </Text>
          {group.transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              item={tx}
              onPress={() => onSelectTransaction(tx)}
              styles={s}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
