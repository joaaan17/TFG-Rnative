# Caché de precios (L1 + L2)

Caché global compartida por símbolo para reducir peticiones al proveedor (Yahoo) y priorizar coherencia y coste.

## TTLs

| Tipo        | Símbolos hot (AAPL, MSFT, AMZN, GOOGL, NVDA, META, TSLA) | Resto |
|------------|----------------------------------------------------------|--------|
| **QUOTE**  | 10 min                                                   | 30 min |
| **HISTORICAL** | 12 h (ejemplo)                                        | 12 h  |

- **Fresh:** `now < expiresAt` → se sirve desde caché.
- **Stale:** `staleAt <= now < expiresAt` → se sirve caché y se lanza refresco en background (SWR).
- **Expired:** `now >= expiresAt` → hay que refrescar; si no hay valor previo, se espera al fetch.

## Cómo activar warmup

- **Automático:** Al arrancar el servidor (tras conectar MongoDB) se inicia un `setInterval` que llama a `priceCacheService.warmupHotSymbols()` cada **10 min**.
- **Manual:** `POST /api/market/cache/warmup` (calienta los 7 símbolos hot con estrategia network-first).

## Cómo ver stats y logs

- **Stats:** `GET /api/market/cache/stats` → `{ hitsL1, hitsL2, misses, inflightCount, sizeL1 }`.
- **Logs:** Prefijo `[PriceCache]` en consola. Ejemplos:
  - `[PriceCache] [QUOTE:AAPL] HIT_L1 age=120s expiresIn=480s`
  - `[PriceCache] [QUOTE:AAPL] HIT_L2 age=540s writingToL1=true`
  - `[PriceCache] [QUOTE:AAPL] MISS_FETCH provider=Yahoo`
  - `[PriceCache] [QUOTE:AAPL] STALE_SERVED age=900s refresh=START`
  - `[PriceCache] [QUOTE:AAPL] INFLIGHT_JOINED`

## Cómo simular carga (curl)

```bash
# Varias peticiones de quotes (deberían deduplicar y usar L1/L2)
for i in 1 2 3 4 5; do curl -s "http://localhost:3000/api/market/quotes?symbols=AAPL,MSFT" | jq .; done

# Stats tras las peticiones
curl -s http://localhost:3000/api/market/cache/stats | jq .

# Warmup manual
curl -s -X POST http://localhost:3000/api/market/cache/warmup | jq .
```

## Definición de hecho

- Con 100 usuarios simultáneos consultando los mismos 7 símbolos, el backend **no** debe hacer 700 llamadas externas por minuto (la caché y la deduplicación in-flight lo evitan).
- Los 7 hot se refrescan cada 10 min vía scheduler o POST /cache/warmup.
- Los logs muestran HIT/MISS/STALE/INFLIGHT con claridad.
- Existe endpoint de stats para verificación.
