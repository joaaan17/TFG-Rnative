# Fuentes de datos de precio (Inversiones)

## Precio actual (cotización)

- **API:** `GET /api/market/quotes?symbols=...`
- **Uso:** Ejecución de órdenes, cards de posiciones y valor total cartera.
- **Dónde se usa:** `useHoldingsWithPrices`, `useCurrentQuotePrice` (reserva en modal).

## Valor actual en "Tu posición" (modal)

- **Prioridad:** 1) Cierre de la **última vela de 6h** (`GET /api/market/candles?timeframe=6h`), 2) quote, 3) overview.
- **Motivo:** El usuario quiere el valor más actualizado posible; las velas de 6h dan mayor granularidad que las de 1D. La línea de precio del gráfico en el modal usa ese mismo valor (6h → quote) para coherencia visual.

## Velas (gráfico)

- **API:** `GET /api/market/candles?symbol=...&timeframe=...&range=...`
- **Uso:** Dibujar velas y rango histórico. En el modal, la línea horizontal de precio usa el mismo valor que "Valor actual" (6h si hay datos, si no quote).

## Overview (modal)

- **API:** `GET /api/market/overview?symbol=...`
- **Uso:** Datos del día (open, high, low, volume, etc.) y fundamentos. No se usa para “precio actual” ni para beneficios; eso viene de quotes.
