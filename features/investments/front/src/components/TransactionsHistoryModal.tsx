import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { CardModal } from '@/shared/components/card-modal';
import { ModalHeader } from '@/shared/components/modal-header';
import { SearchBar } from '@/shared/components/ui/search-bar';
import { Text } from '@/shared/components/ui/text';
import { Hierarchy } from '@/design-system/typography';
import { usePalette } from '@/shared/hooks/use-palette';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { usePortfolio } from '../hooks/usePortfolio';
import { useHoldingsWithPrices } from '../hooks/useHoldingsWithPrices';
import type { TransactionResponse } from '../api/investmentsClient';

export type TransactionsHistoryModalProps = {
  open: boolean;
  onClose: () => void;
};

function formatDate(executedAt: string): string {
  try {
    const d = new Date(executedAt);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const h = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${h}:${min}`;
  } catch {
    return executedAt;
  }
}

function formatTotal(total: number): string {
  return total.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function filterTransactions(
  list: TransactionResponse[] | null,
  query: string,
): TransactionResponse[] {
  if (!list?.length) return [];
  const q = query.trim().toLowerCase();
  if (!q) return list;
  const compraMatch = /compra|buy|comprar/.test(q);
  const ventaMatch = /venta|sell|vender/.test(q);
  return list.filter((tx) => {
    const symbolMatch = tx.symbol.toLowerCase().includes(q);
    const typeMatch =
      (compraMatch && tx.type === 'BUY') || (ventaMatch && tx.type === 'SELL');
    const totalStr = formatTotal(tx.total).replace(/\s/g, '').toLowerCase();
    const totalMatch = totalStr.includes(q.replace(/\s/g, ''));
    const dateStr = formatDate(tx.executedAt).toLowerCase();
    const dateMatch = dateStr.includes(q);
    return symbolMatch || typeMatch || totalMatch || dateMatch;
  });
}

export function TransactionsHistoryModal({
  open,
  onClose,
}: TransactionsHistoryModalProps) {
  const palette = usePalette();
  const { session } = useAuthSession();
  const {
    data: transactions,
    loading,
    error,
  } = useTransactions(session?.token ?? null, open, 200);
  const { data: portfolioData } = usePortfolio(session?.token ?? null, open);
  const { totalValue: holdingsTotalValue } = useHoldingsWithPrices(
    portfolioData?.holdings,
  );
  const [searchQuery, setSearchQuery] = useState('');

  const cashBalance = portfolioData?.cashBalance ?? 0;
  const patrimonioTotal = cashBalance + holdingsTotalValue;

  const filtered = useMemo(
    () => filterTransactions(transactions ?? null, searchQuery),
    [transactions, searchQuery],
  );

  const renderItem = ({ item }: { item: TransactionResponse }) => {
    const isBuy = item.type === 'BUY';
    const label = isBuy ? 'C' : 'V';
    const badgeBg = isBuy ? palette.primary + '22' : palette.destructive + '22';
    const badgeColor = isBuy ? palette.primary : palette.destructive;
    const borderColor = palette.surfaceBorder ?? 'rgba(0,0,0,0.06)';
    const labelColor = palette.icon ?? palette.text;

    return (
      <View
        style={{
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 56,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
                backgroundColor: badgeBg,
              }}
            >
              <Text
                style={[
                  Hierarchy.caption,
                  { fontWeight: '600', color: badgeColor },
                ]}
              >
                {label}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 4, minWidth: 0 }}>
            <Text
              style={[Hierarchy.bodySmallSemibold, { color: palette.text }]}
              numberOfLines={1}
            >
              {item.symbol}
            </Text>
            <Text
              style={[Hierarchy.caption, { marginTop: 2, color: labelColor }]}
              numberOfLines={1}
            >
              {item.shares} × {item.price.toFixed(2)} $ ={' '}
              {formatTotal(item.total)} $
            </Text>
          </View>
          <Text
            style={[Hierarchy.caption, { color: labelColor, marginLeft: 8 }]}
            numberOfLines={1}
          >
            {formatDate(item.executedAt)}
          </Text>
        </View>
        <View
          style={{
            marginTop: 12,
            marginLeft: 56,
            paddingTop: 10,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: palette.surfaceMuted ?? 'rgba(0,0,0,0.04)',
            borderWidth: 1,
            borderColor: borderColor,
            gap: 6,
          }}
        >
          <Text
            style={[Hierarchy.caption, { color: labelColor, marginBottom: 4 }]}
          >
            Detalle de la operación
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={[Hierarchy.bodySmall, { color: labelColor }]}>
              Acciones
            </Text>
            <Text
              style={[
                Hierarchy.action,
                { color: palette.text, fontWeight: '600' },
              ]}
            >
              {item.shares.toLocaleString('es-ES', {
                maximumFractionDigits: 4,
              })}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={[Hierarchy.bodySmall, { color: labelColor }]}>
              {isBuy ? 'Precio de compra' : 'Precio de venta'}
            </Text>
            <Text style={[Hierarchy.action, { color: palette.text }]}>
              {item.price.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              $
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={[Hierarchy.bodySmall, { color: labelColor }]}>
              Total operación
            </Text>
            <Text
              style={[
                Hierarchy.action,
                { color: palette.text, fontWeight: '600' },
              ]}
            >
              {formatTotal(item.total)} $
            </Text>
          </View>
          {!isBuy && (
            <>
              {item.avgBuyPrice != null && Number.isFinite(item.avgBuyPrice) ? (
                <>
                  <View
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTopWidth: 1,
                      borderTopColor: borderColor,
                    }}
                  >
                    <Text
                      style={[
                        Hierarchy.caption,
                        { color: labelColor, marginBottom: 6 },
                      ]}
                    >
                      Beneficio / Pérdida
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={[Hierarchy.bodySmall, { color: labelColor }]}
                      >
                        Precio medio compra
                      </Text>
                      <Text style={[Hierarchy.action, { color: palette.text }]}>
                        {item.avgBuyPrice.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        $
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={[Hierarchy.bodySmall, { color: labelColor }]}
                      >
                        Precio de venta
                      </Text>
                      <Text style={[Hierarchy.action, { color: palette.text }]}>
                        {item.price.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        $
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 4,
                      }}
                    >
                      <Text
                        style={[Hierarchy.bodySmall, { color: labelColor }]}
                      >
                        Diferencia por acción
                      </Text>
                      <Text
                        style={[
                          Hierarchy.action,
                          {
                            fontWeight: '600',
                            color:
                              item.price >= item.avgBuyPrice
                                ? (palette.positive ?? '#16A34A')
                                : (palette.destructive ?? '#E5484D'),
                          },
                        ]}
                      >
                        {item.price >= item.avgBuyPrice ? '+' : ''}
                        {formatTotal(item.price - item.avgBuyPrice)} $
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 4,
                      }}
                    >
                      <Text
                        style={[Hierarchy.bodySmall, { color: labelColor }]}
                      >
                        {item.price >= item.avgBuyPrice
                          ? 'Beneficio total'
                          : 'Pérdida total'}
                      </Text>
                      <Text
                        style={[
                          Hierarchy.action,
                          {
                            fontWeight: '600',
                            color:
                              item.price >= item.avgBuyPrice
                                ? (palette.positive ?? '#16A34A')
                                : (palette.destructive ?? '#E5484D'),
                          },
                        ]}
                      >
                        {item.price >= item.avgBuyPrice ? '+' : ''}
                        {formatTotal(
                          (item.price - item.avgBuyPrice) * item.shares,
                        )}{' '}
                        $
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: borderColor,
                  }}
                >
                  <Text style={[Hierarchy.caption, { color: labelColor }]}>
                    Beneficio/pérdida no disponible para esta venta (operación
                    anterior al registro).
                  </Text>
                </View>
              )}
            </>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: borderColor,
            }}
          >
            <Text style={[Hierarchy.bodySmall, { color: labelColor }]}>
              Fecha
            </Text>
            <Text style={[Hierarchy.action, { color: palette.text }]}>
              {formatDate(item.executedAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <CardModal
      open={open}
      onClose={onClose}
      maxHeightPct={1}
      closeOnBackdropPress
      scrollable
      contentNoPaddingTop
    >
      <View style={{ flex: 1, minHeight: 0 }}>
        <ModalHeader
          title="Historial de transacciones"
          onBack={onClose}
          onClose={onClose}
          backAccessibilityLabel="Volver"
        />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 24,
            minHeight: 200,
          }}
        >
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ej. AAPL, compra, venta"
            autoFocus={false}
            variant="input"
          />

          {!loading && !error && (transactions?.length ?? 0) > 0 && (
            <View
              style={{
                marginTop: 12,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: palette.surfaceMuted ?? 'rgba(0,0,0,0.04)',
                borderWidth: 1,
                borderColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)',
                gap: 8,
              }}
            >
              <Text
                style={[
                  Hierarchy.titleSection,
                  { color: palette.icon ?? palette.text, marginBottom: 4 },
                ]}
              >
                Tu situación actual
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={[
                    Hierarchy.bodySmall,
                    { color: palette.icon ?? palette.text },
                  ]}
                >
                  Efectivo disponible
                </Text>
                <Text
                  style={[
                    Hierarchy.action,
                    { color: palette.text, fontWeight: '600' },
                  ]}
                >
                  {cashBalance.toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  $
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 4,
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: palette.surfaceBorder ?? 'rgba(0,0,0,0.08)',
                }}
              >
                <Text
                  style={[
                    Hierarchy.bodySmall,
                    { color: palette.icon ?? palette.text },
                  ]}
                >
                  Patrimonio total
                </Text>
                <Text
                  style={[
                    Hierarchy.action,
                    { color: palette.text, fontWeight: '600' },
                  ]}
                >
                  {patrimonioTotal.toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  $
                </Text>
              </View>
            </View>
          )}

          {loading && (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={palette.primary} />
            </View>
          )}

          {error && !loading && (
            <View style={{ paddingVertical: 16 }}>
              <Text
                style={[
                  Hierarchy.bodySmall,
                  {
                    textAlign: 'center',
                    color: palette.destructive ?? palette.text,
                  },
                ]}
              >
                {error}
              </Text>
            </View>
          )}

          {!loading && !error && filtered.length === 0 && (
            <View style={{ paddingVertical: 24 }}>
              <Text
                style={[
                  Hierarchy.bodySmall,
                  {
                    textAlign: 'center',
                    color: palette.icon ?? palette.text,
                  },
                ]}
              >
                {transactions?.length === 0
                  ? 'Aún no tienes transacciones.'
                  : searchQuery.trim()
                    ? `Ninguna transacción coincide con "${searchQuery.trim()}".`
                    : 'No se han cargado transacciones.'}
              </Text>
            </View>
          )}

          {!loading && !error && filtered.length > 0 && (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              scrollEnabled
              style={{ flex: 1, marginTop: 12 }}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator
            />
          )}
        </View>
      </View>
    </CardModal>
  );
}

export default TransactionsHistoryModal;
