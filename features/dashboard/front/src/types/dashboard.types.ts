/**
 * Modelo de dominio para el Dashboard (estadísticas).
 * Los DTOs están preparados para cuando el backend exponga estos datos.
 */

/** Resumen global de la cartera (lo primero que ve el usuario). */
export type PortfolioSummary = {
  /** Valor total de la cartera (ej. "12.840 €"). */
  totalValue: string;
  /** Rentabilidad total: importe y porcentaje (ej. "+840 € (+7,0%)"). */
  totalProfitability: { amount: string; percent: string };
  /** Rentabilidad del día: importe y porcentaje (ej. "+42 € (+0,33%)"). */
  dailyProfitability: { amount: string; percent: string };
  /** Cash disponible (ej. "1.200 €"). */
  availableCash: string;
  /** Total invertido (ej. "12.000 €"). */
  totalInvested: string;
};

/** Una tarjeta de métrica: valor principal, etiqueta y barra de progreso (0-100). */
export type DashboardStatCard = {
  id: string;
  value: string;
  label: string;
  /** Porcentaje 0–100 para la barra de progreso. */
  progressPercent: number;
  /** Si true, la card se resalta con fondo primary (ej. "Citas hoy"). */
  highlighted?: boolean;
};

/** Periodo para la sección Ingresos (filtro del gráfico). */
export type IncomePeriod = 'semanal' | 'mensual' | 'trimestral' | 'anual';

/** Punto del gráfico de ingresos (eje X = etiqueta, eje Y = valor). */
export type IncomeChartPoint = {
  label: string;
  value: number;
};

/**
 * Cards de contexto debajo del gráfico (para novatos: qué va bien, qué no, actividad).
 * No repite datos del resumen global.
 */
export type ContextCardBestWorst = {
  id: 'best' | 'worst';
  /** Ej. "Mejor activo" / "Peor activo". */
  label: string;
  /** Nombre del activo (ej. "Nvidia", "Intel"). */
  assetName: string;
  /** Ej. "+42%" / "-12%". */
  percent: string;
};

export type ContextCardMetric = {
  id: 'assets' | 'operations';
  /** Ej. "Activos en cartera" / "Operaciones". */
  label: string;
  /** Valor a mostrar (ej. "5", "12"). */
  value: string;
};

/** Última operación: tipo, activo, cantidad, precios y resultado. */
export type ContextCardLastOperation = {
  id: 'lastOperation';
  /** Ej. "Última operación". */
  label: string;
  /** "Compra" | "Venta". */
  operationType: 'compra' | 'venta';
  /** Ej. "NVDA". */
  assetName: string;
  /** Ej. "3 acciones". */
  quantity: string;
  /** Ej. "hace 2 días". */
  timeAgo: string;
  /** Precio por acción (ej. "142,50 €"). */
  priceFormatted: string;
  /** Importe total (ej. "427,50 €"). */
  totalFormatted: string;
  /** Precio medio de compra (solo ventas; ej. "138,20 €"). */
  avgBuyPriceFormatted?: string;
  /** Resultado ganancia/pérdida (solo ventas; ej. "+8,60 €" o "-12,40 €"). */
  profitLossFormatted?: string;
};

/** Volatilidad de la cartera. */
export type ContextCardVolatility = {
  id: 'volatility';
  /** Ej. "Volatilidad". */
  label: string;
  /** Ej. "Media", "15%", etc. */
  value: string;
};

/** Activo dominante: el de mayor peso en la cartera. */
export type ContextCardDominantAsset = {
  id: 'dominant';
  /** Ej. "Activo dominante". */
  label: string;
  /** Símbolo del activo (ej. "NVDA"). */
  assetName: string;
  /** Porcentaje que representa en la cartera (ej. "42%" o "35,5%"). */
  weightPercent: string;
};

export type ContextCard =
  | ContextCardBestWorst
  | ContextCardMetric
  | ContextCardLastOperation
  | ContextCardVolatility
  | ContextCardDominantAsset;

/** Estado de datos del dashboard (origen: mock ahora; API después). */
export type DashboardStats = {
  /** Resumen global: valor total, rentabilidad, cash, invertido. */
  portfolioSummary: PortfolioSummary;
  /** Cards debajo del gráfico: mejor/peor inversión, activos, operaciones. */
  contextCards: ContextCard[];
  statCards: DashboardStatCard[];
  incomePeriods: { value: IncomePeriod; label: string }[];
  /** Datos del gráfico para el periodo seleccionado. */
  incomeChartData: IncomeChartPoint[];
};
