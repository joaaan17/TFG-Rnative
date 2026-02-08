import type { Request, Response } from 'express';
import { getMarketChartUseCase } from '../config/market-chart.wiring';

export const getMarketChartController = async (
  req: Request,
  res: Response,
) => {
  try {
    const symbol =
      typeof req.query.symbol === 'string' ? req.query.symbol : 'BTC';
    const interval =
      typeof req.query.interval === 'string' ? req.query.interval : '1d';
    const from = Number(req.query.from) || 0;
    const to = Number(req.query.to) || Math.floor(Date.now() / 1000);

    const data = await getMarketChartUseCase.execute({
      symbol,
      interval,
      from,
      to,
    });

    res.status(200).json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error al obtener datos del gráfico';
    res.status(500).json({ message });
  }
};
