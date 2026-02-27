/**
 * Composition root de la feature Market.
 * Exporta el router para montar en el server: app.use('/api/market', marketRouter)
 */
import marketRouter from './api/market.routes';
import { priceCacheService } from './config/market.wiring';

const WARMUP_INTERVAL_MS = 10 * 60 * 1000; // 10 min

/** Inicia el scheduler que calienta HOT_SYMBOLS cada 10 min. Llamar tras conectar MongoDB. */
export function startPriceCacheWarmup(): void {
  const run = (): void => {
    priceCacheService.warmupHotSymbols().catch((e) => {
      console.error('[PriceCache] warmup error', e);
    });
  };
  run();
  setInterval(run, WARMUP_INTERVAL_MS);
  console.log('[PriceCache] warmup scheduler started (every 10 min)');
}

export { marketRouter };
export {
  getCandlesUseCase,
  getQuotesUseCase,
  searchMarketUseCase,
} from './config/market.wiring';
