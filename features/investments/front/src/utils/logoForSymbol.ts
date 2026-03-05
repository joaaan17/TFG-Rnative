/**
 * URL del logo/favicon por símbolo. Usa DuckDuckGo Icons (más fiable que Google,
 * evita 404 de t3.gstatic.com/faviconV2).
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
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}
