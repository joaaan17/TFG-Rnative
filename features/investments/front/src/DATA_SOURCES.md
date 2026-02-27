# Fuentes de datos de precio (Inversiones)

## Precio actual (cotización)

- **API:** `GET /api/market/quotes?symbols=...`
- **Uso:** Misma fuente para ejecución de órdenes, valor de posiciones y visualización.
- **Dónde se usa:**
  - `useHoldingsWithPrices`: precios en cards de posiciones y valor total cartera.
  - `useCurrentQuotePrice`: Valor actual y Beneficios en el modal de activo; línea de precio del gráfico (`PortfolioChart` con `currentPrice`).
- **Objetivo:** Un solo “precio actual” para que beneficios realizados, no realizados y la línea del gráfico sean coherentes con el precio al que se ejecutan compra/venta. El precio ya no depende del timeframe de velas (6h / 1D / 1M).

## Velas (gráfico)

- **API:** `GET /api/market/candles?symbol=...&timeframe=...&range=...`
- **Uso:** Solo para dibujar velas y rango histórico. La línea horizontal de “precio actual” en el gráfico viene de quotes (`currentPrice`), no del cierre de la última vela.

## Overview (modal)

- **API:** `GET /api/market/overview?symbol=...`
- **Uso:** Datos del día (open, high, low, volume, etc.) y fundamentos. No se usa para “precio actual” ni para beneficios; eso viene de quotes.
