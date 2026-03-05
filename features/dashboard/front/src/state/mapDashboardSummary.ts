/**
 * Mapeo API → modelo de vista (Dashboard).
 * Convierte la respuesta de GET /portfolio/summary en PortfolioSummary y ContextCard[].
 */
import type {
  PortfolioSummary,
  ContextCard,
  ContextCardBestWorst,
  ContextCardMetric,
  ContextCardLastOperation,
  ContextCardVolatility,
} from '../types/dashboard.types';
import type { DashboardSummaryApiResponse } from '@/features/investments/front/src/api/investmentsClient';

const CURRENCY_DISPLAY = 'EUR';

function formatCurrency(value: number, currency: string = CURRENCY_DISPLAY): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}%`;
}

function getTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffDays >= 1) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  if (diffHours >= 1) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffMinutes >= 1) return `hace ${diffMinutes} min`;
  return 'ahora';
}

export function mapSummaryToPortfolioSummary(
  summary: DashboardSummaryApiResponse['summary'],
): PortfolioSummary {
  const currency = summary.currency || CURRENCY_DISPLAY;
  return {
    totalValue: formatCurrency(summary.totalValue, currency),
    totalProfitability: {
      amount: formatCurrency(summary.totalProfitability.amount, currency),
      percent: formatPercent(summary.totalProfitability.percent),
    },
    dailyProfitability: {
      amount: formatCurrency(summary.dailyProfitability.amount, currency),
      percent: formatPercent(summary.dailyProfitability.percent),
    },
    availableCash: formatCurrency(summary.availableCash, currency),
    totalInvested: formatCurrency(summary.totalInvested, currency),
  };
}

export function mapContextToContextCards(
  context: DashboardSummaryApiResponse['context'],
): ContextCard[] {
  const cards: ContextCard[] = [];

  if (context.bestAsset) {
    cards.push({
      id: 'best',
      label: 'Mejor activo',
      assetName: context.bestAsset.symbol,
      percent: formatPercent(context.bestAsset.percent),
    } as ContextCardBestWorst);
  }

  if (context.worstAsset) {
    cards.push({
      id: 'worst',
      label: 'Peor activo',
      assetName: context.worstAsset.symbol,
      percent: formatPercent(context.worstAsset.percent),
    } as ContextCardBestWorst);
  }

  cards.push({
    id: 'assets',
    label: 'Activos en cartera',
    value: String(context.assetsCount),
  } as ContextCardMetric);

  cards.push({
    id: 'operations',
    label: 'Operaciones',
    value: String(context.operationsCount),
  } as ContextCardMetric);

  if (context.lastOperation) {
    const op = context.lastOperation;
    const typeLabel = op.type === 'BUY' ? 'compra' : 'venta';
    const quantity = `${op.shares} acción${op.shares !== 1 ? 'es' : ''}`;
    cards.push({
      id: 'lastOperation',
      label: 'Última operación',
      operationType: typeLabel as 'compra' | 'venta',
      assetName: op.symbol,
      quantity,
      timeAgo: getTimeAgo(op.executedAt),
    } as ContextCardLastOperation);
  }

  cards.push({
    id: 'volatility',
    label: 'Volatilidad',
    value: 'Media',
  } as ContextCardVolatility);

  return cards;
}
