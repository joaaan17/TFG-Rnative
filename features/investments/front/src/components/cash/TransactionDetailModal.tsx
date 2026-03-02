import React from 'react';
import { View } from 'react-native';

import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import { Spacing } from '@/design-system/spacing';

import type { CashTransactionView } from '../../types/cash.types';

const ENTRY_GREEN = '#16A34A';

export type TransactionDetailModalProps = {
  open: boolean;
  onClose: () => void;
  transaction: CashTransactionView | null;
};

function formatDateHour(iso: string): string {
  try {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const h = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${h}:${min}`;
  } catch {
    return iso;
  }
}

function formatMoney(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getTypeTitle(tx: CashTransactionView): string {
  if (tx.type === 'BUY') return `Compra ${tx.symbol ?? ''}`.trim();
  if (tx.type === 'SELL') return `Venta ${tx.symbol ?? ''}`.trim();
  return 'Movimiento';
}

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  const palette = usePalette();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
      }}
    >
      <Text style={[Hierarchy.bodySmall, { color: palette.icon }]}>
        {label}
      </Text>
      <Text
        style={[
          Hierarchy.bodySmallSemibold,
          { color: valueColor ?? palette.text },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export function TransactionDetailModal({
  open,
  onClose,
  transaction,
}: TransactionDetailModalProps) {
  const palette = usePalette();
  const borderColor = palette.surfaceBorder ?? 'rgba(0,0,0,0.08)';

  if (!transaction) return null;

  const t = transaction.raw;
  const isBuy = transaction.type === 'BUY';
  const amountColor = transaction.amount >= 0 ? ENTRY_GREEN : palette.destructive;

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={0.85}
      closeOnBackdropPress
      scrollable
      contentNoPaddingTop
    >
      <View style={{ flex: 1, minHeight: 0 }}>
        <ModalHeader
          title={getTypeTitle(transaction)}
          subtitle="Completada"
          onClose={onClose}
          closeAccessibilityLabel="Cerrar"
        />
        <View
          style={{
            paddingHorizontal: Spacing.md,
            paddingBottom: Spacing.xl,
            gap: Spacing.lg,
          }}
        >
          <View
            style={{
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.md,
              borderRadius: 12,
              backgroundColor: palette.surfaceMuted ?? 'rgba(0,0,0,0.04)',
              borderWidth: 1,
              borderColor,
            }}
          >
            <Text
              style={[Hierarchy.caption, { color: palette.icon, marginBottom: 4 }]}
            >
              Importe total
            </Text>
            <Text
              style={[
                Hierarchy.titleModal,
                { color: amountColor },
              ]}
            >
              {transaction.amount >= 0 ? '+' : '−'}
              {formatMoney(Math.abs(transaction.amount))} $
            </Text>
            <DetailRow
              label="Fecha y hora"
              value={formatDateHour(transaction.createdAt)}
            />
            <DetailRow
              label="ID"
              value={transaction.id.slice(-8)}
            />
          </View>

          <View
            style={{
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.md,
              borderRadius: 12,
              backgroundColor: palette.surfaceMuted ?? 'rgba(0,0,0,0.04)',
              borderWidth: 1,
              borderColor,
            }}
          >
            <Text
              style={[
                Hierarchy.titleSection,
                { color: palette.icon ?? palette.text, marginBottom: Spacing.sm },
              ]}
            >
              Detalle de la operación
            </Text>
            <DetailRow label="Activo" value={t.symbol} />
            <DetailRow
              label="Cantidad"
              value={`${t.shares.toLocaleString('es-ES', { maximumFractionDigits: 4 })} acciones`}
            />
            <DetailRow
              label={isBuy ? 'Precio por acción' : 'Precio de venta'}
              value={`${formatMoney(t.price)} $`}
            />
            {transaction.fee != null && transaction.fee > 0 && (
              <DetailRow
                label="Comisión"
                value={`−${formatMoney(transaction.fee)} $`}
              />
            )}
            <View
              style={{
                marginTop: Spacing.xs,
                paddingTop: Spacing.sm,
                borderTopWidth: 1,
                borderTopColor: borderColor,
              }}
            >
              <DetailRow
                label={isBuy ? 'Total pagado' : 'Total recibido'}
                value={`${formatMoney(Math.abs(transaction.amount))} $`}
                valueColor={amountColor}
              />
            </View>
            {!isBuy && t.avgBuyPrice != null && Number.isFinite(t.avgBuyPrice) && (
              <>
                <DetailRow
                  label="Precio medio compra"
                  value={`${formatMoney(t.avgBuyPrice)} $`}
                />
                <DetailRow
                  label="Beneficio / Pérdida"
                  value={`${(transaction.amount >= 0 ? '+' : '')}${formatMoney((t.price - t.avgBuyPrice) * t.shares)} $`}
                  valueColor={
                    t.price >= t.avgBuyPrice ? ENTRY_GREEN : palette.destructive
                  }
                />
              </>
            )}
          </View>
        </View>
      </View>
    </CardModal>
  );
}
