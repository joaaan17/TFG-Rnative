/**
 * Composition root de la feature Market.
 * Exporta el router para montar en el server: app.use('/api/market', marketRouter)
 */
import marketRouter from './api/market.routes';

export { marketRouter };
export {
  getCandlesUseCase,
  getQuotesUseCase,
  searchMarketUseCase,
} from './config/market.wiring';
