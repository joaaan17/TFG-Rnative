import { Platform } from 'react-native';

function getBaseUrl(): string {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api/investments';
  return 'http://localhost:3000/api/investments';
}

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  avgBuyPrice: number;
  lastUpdatedAt: string;
}

export interface PortfolioResponse {
  cashBalance: number;
  currency: string;
  holdings: PortfolioHolding[];
}

export interface TransactionResponse {
  _id: string;
  userId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total: number;
  executedAt: string;
  /** Precio medio de compra en el momento de la venta (solo SELL). Para beneficio/pérdida por acción. */
  avgBuyPrice?: number;
}

export interface BuyOrderResponse {
  updatedPortfolio: PortfolioResponse;
  createdTransaction: TransactionResponse;
}

export interface SellOrderResponse {
  updatedPortfolio: PortfolioResponse;
  createdTransaction: TransactionResponse;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getMessage(data: unknown, fallback: string): string {
  if (data != null && typeof (data as { message?: string }).message === 'string') {
    return (data as { message: string }).message;
  }
  return fallback;
}

export async function getPortfolio(token: string): Promise<PortfolioResponse> {
  const response = await fetch(`${getBaseUrl()}/portfolio/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(getMessage(data, 'Error al obtener la cartera'));
  }
  return data as PortfolioResponse;
}

export async function postBuyOrder(
  token: string,
  symbol: string,
  shares: number,
  signal?: AbortSignal,
): Promise<BuyOrderResponse> {
  const response = await fetch(`${getBaseUrl()}/orders/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ symbol: symbol.trim().toUpperCase(), shares }),
    signal,
  });
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(getMessage(data, 'Error al ejecutar la compra'));
  }
  return data as BuyOrderResponse;
}

export async function postSellOrder(
  token: string,
  symbol: string,
  shares: number,
  signal?: AbortSignal,
): Promise<SellOrderResponse> {
  const response = await fetch(`${getBaseUrl()}/orders/sell`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ symbol: symbol.trim().toUpperCase(), shares }),
    signal,
  });
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(getMessage(data, 'Error al ejecutar la venta'));
  }
  return data as SellOrderResponse;
}

export async function getTransactions(
  token: string,
  limit: number = 50,
): Promise<{ transactions: TransactionResponse[] }> {
  const response = await fetch(`${getBaseUrl()}/transactions/me?limit=${limit}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(getMessage(data, 'Error al obtener transacciones'));
  }
  return data as { transactions: TransactionResponse[] };
}

// --- Portfolio overview (composición y markers) ---

export type OverviewTimeframe = '6h' | '1d' | '1mo';
export type OverviewRange = '1wk' | '1mo' | '3mo' | '6mo' | '1y';

export interface AllocationItemResponse {
  symbol: string;
  name: string;
  value: number;
  weight: number;
}

export interface PortfolioMarkerResponse {
  t: number;
  side: 'BUY' | 'SELL';
  count: number;
  amount: number;
}

export interface PortfolioOverviewResponse {
  totalValue: number;
  allocation: AllocationItemResponse[];
  markers: PortfolioMarkerResponse[];
}

export async function getPortfolioOverview(
  token: string,
  timeframe: OverviewTimeframe = '1d',
  range: OverviewRange = '6mo',
): Promise<PortfolioOverviewResponse> {
  const params = new URLSearchParams({ timeframe, range });
  const response = await fetch(`${getBaseUrl()}/portfolio/overview?${params}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(getMessage(data, 'Error al obtener resumen de cartera'));
  }
  return data as PortfolioOverviewResponse;
}
