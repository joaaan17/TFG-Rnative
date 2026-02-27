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

---

## Uso de peticiones y límites

Las APIs de precios del backend (`/api/market/quotes`, `/api/market/candles`, `/api/market/overview`) llaman a **Yahoo Finance**, que aplica límites no oficiales (suelen citarse **~360 peticiones/hora por IP**; en la práctica pueden devolver 429 si hay muchas peticiones seguidas).

**Origen de peticiones en el front:**

| Origen | API | Frecuencia |
|--------|-----|------------|
| Lista de posiciones (precios) | quotes | 1 vez al cargar/cambiar cartera |
| Precio actual en modal | quotes | cada 10 s (modal abierto) |
| Gráfico principal (precio línea) | quotes | cada 30 s |
| Gráfico principal (velas) | candles | cada 60 s |
| Modal: gráfico + valor 6h | candles | 2 peticiones cada 60 s (mismo símbolo, timeframe distinto) |
| Minigráficos en cards | candles | **1 petición por posición** cada 2 min |
| Overview (modal) | overview | cada 30 s (backend tiene caché 30 s) |

**Backend (caché L1 + L2):** Las peticiones a `/quotes` y `/candles` pasan por `PriceCacheService`: L1 en memoria (rápido), L2 en MongoDB (compartido y persistente), deduplicación in-flight y SWR (stale-while-revalidate). TTL quotes: 10 min (símbolos hot) / 30 min (resto); histórico 12 h. Warmup de los 7 hot cada 10 min. Ver `features/market/back/src/infrastructure/cache/README.md`.
