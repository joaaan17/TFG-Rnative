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
  ContextCardDominantAsset,
} from '../types/dashboard.types';
import type {
  DashboardSummaryApiResponse,
  TransactionResponse,
} from '@/features/investments/front/src/api/investmentsClient';

const CURRENCY_DISPLAY = 'EUR';

function formatCurrency(
  value: number,
  currency: string = CURRENCY_DISPLAY,
): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPrice(
  value: number,
  currency: string = CURRENCY_DISPLAY,
): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
  if (diffHours >= 1)
    return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
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
  currency: string = CURRENCY_DISPLAY,
  /** Transacciones del modal operaciones (GET /transactions/me). Si lastOperation tiene datos incompletos, se usan para rellenar. */
  transactionsFromModal?: TransactionResponse[],
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

  if (context.dominantAsset) {
    cards.push({
      id: 'dominant',
      label: 'Activo dominante',
      assetName: context.dominantAsset.symbol,
      weightPercent: `${context.dominantAsset.weightPercent.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })}%`,
    } as ContextCardDominantAsset);
  }

  cards.push({
    id: 'volatility',
    label: 'Volatilidad',
    value: 'Media',
  } as ContextCardVolatility);

  if (context.lastOperation) {
    const op = context.lastOperation;
    const typeLabel = op.type === 'BUY' ? 'compra' : 'venta';
    const quantity = `${op.shares} acción${op.shares !== 1 ? 'es' : ''}`;

    // Usar datos del summary; si faltan, intentar con la primera transacción del modal (misma API que usa el modal operaciones)
    let price = Number(op.price) || 0;
    let total = Number(op.total) || 0;
    let avgBuyPrice =
      op.type === 'SELL' && op.avgBuyPrice != null
        ? Number(op.avgBuyPrice)
        : undefined;
    let profitLoss =
      op.type === 'SELL' && op.profitLoss != null
        ? Number(op.profitLoss)
        : undefined;

    if ((price <= 0 || total <= 0) && transactionsFromModal?.length) {
      const fallback = transactionsFromModal[0];
      if (
        fallback.symbol === op.symbol &&
        fallback.type === op.type
      ) {
        price = Number(fallback.price) || price;
        total = Number(fallback.total) || total;
        if (fallback.avgBuyPrice != null)
          avgBuyPrice = Number(fallback.avgBuyPrice);
        if (op.type === 'SELL' && avgBuyPrice != null && total > 0) {
          profitLoss = total - avgBuyPrice * op.shares;
        }
      }
    }

    const hasValidPrice = price > 0;
    const hasValidTotal = total > 0;
    cards.push({
      id: 'lastOperation',
      label: 'Última operación',
      operationType: typeLabel as 'compra' | 'venta',
      assetName: op.symbol,
      quantity,
      timeAgo: getTimeAgo(op.executedAt),
      priceFormatted: hasValidPrice
        ? formatPrice(price, currency)
        : 'No disp.',
      totalFormatted: hasValidTotal
        ? formatCurrency(total, currency)
        : 'No disp.',
      avgBuyPriceFormatted:
        avgBuyPrice != null && avgBuyPrice > 0
          ? formatPrice(avgBuyPrice, currency)
          : undefined,
      profitLossFormatted:
        profitLoss != null && Number.isFinite(profitLoss)
          ? `${profitLoss >= 0 ? '+' : ''}${formatPrice(profitLoss, currency)}`
          : undefined,
    } as ContextCardLastOperation);
  }

  return cards;
}
