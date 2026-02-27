/**
 * URL del logo/favicon por símbolo (Google Favicon API, sin API key).
 * Usado en buscador y en la lista de posiciones.
 */
const SYMBOL_DOMAINS: Record<string, string> = {
  AAPL: 'apple.com',
  TSLA: 'tesla.com',
  NVDA: 'nvidia.com',
  MSFT: 'microsoft.com',
  GOOGL: 'google.com',
  AMZN: 'amazon.com',
  META: 'meta.com',
  GLD: 'spdr.com',
  'BTC-USD': 'bitcoin.org',
};

export function getLogoUrlForSymbol(symbol: string): string | undefined {
  const key = (symbol || '').trim().toUpperCase();
  const domain = SYMBOL_DOMAINS[key];
  if (!domain) return undefined;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
