import { useMemo } from 'react';

import type {
  CashMonthlySummary,
  CashTransactionGroup,
  CashTransactionView,
} from '../types/cash.types';
import type { TransactionResponse } from '../api/investmentsClient';
import { usePortfolio } from './usePortfolio';
import { useTransactions } from './useTransactions';

const CURRENCY = 'USD';

function toCashTransactionView(t: TransactionResponse): CashTransactionView {
  const isBuy = t.type === 'BUY';
  const amount = isBuy ? -t.total : t.total;
  return {
    id: t._id,
    type: t.type,
    amount,
    currency: CURRENCY,
    createdAt: t.executedAt,
    status: 'completed',
    symbol: t.symbol,
    quantity: t.shares,
    price: t.price,
    fee: undefined,
    raw: t,
  };
}

function getDateGroupLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (txDate.getTime() === today.getTime()) return 'Hoy';
  if (txDate.getTime() === yesterday.getTime()) return 'Ayer';
  const day = d.getDate();
  const month = d.toLocaleDateString('es-ES', { month: 'short' });
  return `${day} ${month}`;
}

function groupTransactionsByDate(list: CashTransactionView[]): CashTransactionGroup[] {
  const byLabel = new Map<string, CashTransactionView[]>();
  for (const tx of list) {
    const label = getDateGroupLabel(tx.createdAt);
    const arr = byLabel.get(label) ?? [];
    arr.push(tx);
    byLabel.set(label, arr);
  }
  const order = ['Hoy', 'Ayer'];
  const rest = Array.from(byLabel.entries())
    .filter(([label]) => !order.includes(label))
    .sort((a, b) => {
      const dateA = new Date((a[1][0]?.createdAt ?? 0) as string).getTime();
      const dateB = new Date((b[1][0]?.createdAt ?? 0) as string).getTime();
      return dateB - dateA;
    });
  const result: CashTransactionGroup[] = [];
  for (const label of order) {
    const txs = byLabel.get(label);
    if (txs?.length) result.push({ label, transactions: txs });
  }
  for (const [label, transactions] of rest) {
    result.push({ label, transactions });
  }
  return result;
}

/**
 * Hook que expone balance, resumen mensual y transacciones agrupadas por fecha.
 * No mezcla lógica de red: usa usePortfolio y useTransactions.
 */
export function useCashOverview(token: string | null, enabled: boolean) {
  const { data: portfolio, loading: loadingPortfolio, refetch: refetchPortfolio } = usePortfolio(
    token,
    enabled,
  );
  const {
    data: transactions,
    loading: loadingTransactions,
    refetch: refetchTransactions,
  } = useTransactions(token, enabled, 100);

  const balance = portfolio?.cashBalance ?? 0;

  const monthly = useMemo((): CashMonthlySummary => {
    if (!transactions?.length) return { in: 0, out: 0, fees: 0 };
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let inSum = 0;
    let outSum = 0;
    for (const t of transactions) {
      const date = new Date(t.executedAt);
      if (date < startOfMonth) continue;
      if (t.type === 'SELL') inSum += t.total;
      else if (t.type === 'BUY') outSum += t.total;
    }
    return { in: inSum, out: outSum, fees: 0 };
  }, [transactions]);

  const flatTransactions = useMemo((): CashTransactionView[] => {
    if (!transactions?.length) return [];
    return transactions.map(toCashTransactionView);
  }, [transactions]);

  const grouped = useMemo((): CashTransactionGroup[] => {
    if (!flatTransactions.length) return [];
    return groupTransactionsByDate(flatTransactions);
  }, [flatTransactions]);

  const refetch = useMemo(
    () => () => {
      refetchPortfolio();
      refetchTransactions();
    },
    [refetchPortfolio, refetchTransactions],
  );

  return {
    balance,
    currency: portfolio?.currency ?? CURRENCY,
    monthly,
    groupedTransactions: grouped,
    /** Lista plana de todas las transacciones (para calendario y filtros por día). */
    flatTransactions,
    loading: loadingPortfolio || loadingTransactions,
    refetch,
  };
}
