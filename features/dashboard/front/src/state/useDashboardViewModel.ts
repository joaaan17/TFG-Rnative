import React from 'react';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import {
  getPortfolioSummary,
  getTransactions,
} from '@/features/investments/front/src/api/investmentsClient';
import {
  mapSummaryToPortfolioSummary,
  mapContextToContextCards,
} from './mapDashboardSummary';
import type {
  ContextCard,
  DashboardStatCard,
  IncomePeriod,
  IncomeChartPoint,
  DashboardStats,
  PortfolioSummary,
} from '../types/dashboard.types';
import type { DonutSegment } from '../types/portfolio-chart.types';

/**
 * Paleta para donut: colores bien diferenciados (azules + cyan/violeta).
 * Índices espaciados evitan que segmentos consecutivos sean similares.
 */
const DONUT_PALETTE = [
  '#0f172a', // navy oscuro
  '#1e40af', // azul profundo
  '#0891b2', // cyan
  '#2563eb', // azul medio
  '#7c3aed', // violeta
  '#06b6d4', // turquesa
  '#60a5fa', // azul claro
] as const;

/** Ordena por value descendente y asigna colores bien diferenciados (índices espaciados). */
function segmentsWithBlueScale(
  segments: Omit<DonutSegment, 'color'>[],
): DonutSegment[] {
  const sorted = [...segments].sort((a, b) => b.value - a.value);
  const n = DONUT_PALETTE.length;
  return sorted.map((seg, i) => ({
    ...seg,
    color: DONUT_PALETTE[(i * 2) % n] ?? DONUT_PALETTE[i % n],
  }));
}

/** Fallback cuando no hay datos (cartera vacía o sin respuesta). */
const FALLBACK_SINGLE: Omit<DonutSegment, 'color'>[] = [
  { label: 'Sin datos', value: 100 },
];

/** Fallback mock geográfica (solo si API no devuelve datos). */
const GEO_SEGMENTS_FALLBACK: Omit<DonutSegment, 'color'>[] = [
  { label: 'Sin datos', value: 100 },
];

/** Distribución por acciones/activos (mock). */
const STOCKS_SEGMENTS_RAW: Omit<DonutSegment, 'color'>[] = [
  { label: 'Apple', value: 28 },
  {
    label: 'Nvidia',
    value: 25,
  },
  {
    label: 'Google',
    value: 22,
  },
  { label: 'Microsoft', value: 15 },
  { label: 'Intel', value: 10 },
];

const SECTOR_FALLBACK: DonutSegment[] = segmentsWithBlueScale(FALLBACK_SINGLE);
const GEO_FALLBACK: DonutSegment[] = segmentsWithBlueScale(
  GEO_SEGMENTS_FALLBACK,
);
const STOCKS_SEGMENTS: DonutSegment[] =
  segmentsWithBlueScale(STOCKS_SEGMENTS_RAW);

/** Traduce sector de Yahoo (en inglés) a español para UI limpia. */
const SECTOR_LABELS: Record<string, string> = {
  Technology: 'Tecnología',
  Healthcare: 'Salud',
  Financial: 'Finanzas',
  'Consumer Cyclical': 'Consumo cíclico',
  'Consumer Defensive': 'Consumo defensivo',
  Energy: 'Energía',
  Industrials: 'Industrial',
  'Communication Services': 'Comunicación',
  'Real Estate': 'Inmobiliario',
  'Basic Materials': 'Materiales básicos',
  Utilities: 'Servicios públicos',
};

function sectorLabel(sector: string): string {
  return SECTOR_LABELS[sector] ?? sector;
}

/** Datos mock; reemplazar por llamadas a API cuando exista backend. */
function getMockSummary(): PortfolioSummary {
  return {
    totalValue: '12.840 €',
    totalProfitability: { amount: '+840 €', percent: '+7,0%' },
    dailyProfitability: { amount: '+42 €', percent: '+0,33%' },
    availableCash: '1.200 €',
    totalInvested: '12.000 €',
  };
}

/** Cards de contexto (debajo del gráfico): 6 cards + activo dominante. Mock. */
function getMockContextCards(): ContextCard[] {
  return [
    { id: 'best', label: 'Mejor activo', assetName: 'NVDA', percent: '+42%' },
    { id: 'worst', label: 'Peor activo', assetName: 'GOOGL', percent: '-12%' },
    { id: 'assets', label: 'Activos en cartera', value: '5' },
    { id: 'operations', label: 'Operaciones', value: '12' },
    {
      id: 'dominant',
      label: 'Activo dominante',
      assetName: 'NVDA',
      weightPercent: '28%',
    },
    { id: 'volatility', label: 'Volatilidad', value: 'Media' },
    {
      id: 'lastOperation',
      label: 'Última operación',
      operationType: 'venta',
      assetName: 'NVDA',
      quantity: '2 acciones',
      timeAgo: 'hace 2 días',
      priceFormatted: '142,50 €',
      totalFormatted: '285 €',
      avgBuyPriceFormatted: '138,20 €',
      profitLossFormatted: '+8,60 €',
    },
  ];
}

/** Datos mock; reemplazar por llamadas a API cuando exista backend. */
function getMockStats(): DashboardStats {
  return {
    portfolioSummary: getMockSummary(),
    contextCards: getMockContextCards(),
    statCards: [
      {
        id: 'today',
        value: '12',
        label: 'Citas hoy',
        progressPercent: 45,
        highlighted: true,
      },
      {
        id: 'week',
        value: '68',
        label: 'Citas esta semana',
        progressPercent: 62,
      },
      {
        id: 'clients',
        value: '124',
        label: 'Clientes',
        progressPercent: 80,
      },
      {
        id: 'income',
        value: '2.840 €',
        label: 'Ingresos',
        progressPercent: 85,
      },
    ],
    incomePeriods: [
      { value: 'semanal', label: 'Semanal' },
      { value: 'mensual', label: 'Mensual' },
      { value: 'trimestral', label: 'Trimestral' },
      { value: 'anual', label: 'Anual' },
    ],
    incomeChartData: [
      { label: 'L', value: 120 },
      { label: 'M', value: 180 },
      { label: 'X', value: 140 },
      { label: 'J', value: 220 },
      { label: 'V', value: 190 },
      { label: 'S', value: 260 },
      { label: 'D', value: 240 },
    ],
  };
}

export type UseDashboardViewModelResult = {
  /** Resumen global de la cartera (valor total, rentabilidad, cash, invertido). */
  portfolioSummary: PortfolioSummary;
  /** Gráfico circular: sector, región o acciones. */
  activeChart: 'sector' | 'geo' | 'stocks';
  setActiveChart: (chart: 'sector' | 'geo' | 'stocks') => void;
  donutSegments: DonutSegment[];
  /** Cards de contexto debajo del gráfico: mejor/peor inversión, activos, operaciones. */
  contextCards: ContextCard[];
  /** Tarjetas de métricas (2x2). */
  statCards: DashboardStatCard[];
  /** Periodos para el filtro de Ingresos. */
  incomePeriods: { value: IncomePeriod; label: string }[];
  /** Periodo seleccionado. */
  selectedPeriod: IncomePeriod;
  setSelectedPeriod: (period: IncomePeriod) => void;
  /** Datos del gráfico de ingresos para el periodo actual. */
  incomeChartData: IncomeChartPoint[];
  /** Recargar datos desde API. */
  refetch: () => void;
  /** Cargando resumen/contexto desde backend. */
  loadingSummary: boolean;
  /** Error al cargar (mensaje o null). */
  summaryError: string | null;
};

export function useDashboardViewModel(): UseDashboardViewModelResult {
  const { session } = useAuthSession();
  const token = session?.token ?? null;

  const [stats, setStats] = React.useState<DashboardStats>(getMockStats);
  const [loadingSummary, setLoadingSummary] = React.useState(true);
  const [summaryError, setSummaryError] = React.useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] =
    React.useState<IncomePeriod>('semanal');
  const [activeChart, setActiveChart] = React.useState<
    'sector' | 'geo' | 'stocks'
  >('sector');

  const [allocationStocks, setAllocationStocks] = React.useState<
    { symbol: string; name: string; value: number; weight: number }[]
  >([]);
  const [allocationSectors, setAllocationSectors] = React.useState<
    { sector: string; value: number; weight: number }[]
  >([]);
  const [allocationGeography, setAllocationGeography] = React.useState<
    { region: string; value: number; weight: number }[]
  >([]);

  const fetchSummary = React.useCallback(async () => {
    if (!token) {
      setLoadingSummary(false);
      setSummaryError(null);
      return;
    }
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const [data, transactionsResult] = await Promise.all([
        getPortfolioSummary(token),
        getTransactions(token, 10),
      ]);
      setAllocationStocks(data.allocationStocks ?? []);
      setAllocationSectors(data.allocationSectors ?? []);
      setAllocationGeography(data.allocationGeography ?? []);
      const currency = data.summary?.currency ?? 'EUR';
      setStats((prev) => ({
        ...prev,
        portfolioSummary: mapSummaryToPortfolioSummary(data.summary),
        contextCards: mapContextToContextCards(
          data.context,
          currency,
          transactionsResult?.transactions ?? [],
        ),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar el resumen';
      const isNetworkError =
        /fetch|network|failed to fetch|connection|econnrefused/i.test(
          message,
        ) || message === '';
      if (!isNetworkError) setSummaryError(message);
    } finally {
      setLoadingSummary(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refetch = React.useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  const sectorDonutSegmentsFromApi = React.useMemo(() => {
    if (!Array.isArray(allocationSectors) || allocationSectors.length === 0) {
      return SECTOR_FALLBACK;
    }
    const total = allocationSectors.reduce(
      (s, a) =>
        s + (typeof a.value === 'number' ? a.value : Number(a.value) || 0),
      0,
    );
    if (total <= 0) return SECTOR_FALLBACK;
    const raw: Omit<DonutSegment, 'color'>[] = allocationSectors.map((a) => {
      const val = typeof a.value === 'number' ? a.value : Number(a.value) || 0;
      const pct = Math.round((val / total) * 1000) / 10;
      return {
        label: sectorLabel(String(a.sector ?? '').trim()) || 'Otros',
        value: pct,
      };
    });
    return segmentsWithBlueScale(raw);
  }, [allocationSectors]);

  const geographyDonutSegmentsFromApi = React.useMemo(() => {
    const hasGeo = Array.isArray(allocationGeography) && allocationGeography.length > 0;
    if (!hasGeo) {
      // Fallback: si hay datos de acciones pero no geográficos, mostrar "Otros" con el total
      if (Array.isArray(allocationStocks) && allocationStocks.length > 0) {
        const total = allocationStocks.reduce(
          (s, a) => s + (typeof a.value === 'number' ? a.value : Number(a.value) || 0),
          0,
        );
        if (total > 0) {
          return segmentsWithBlueScale([
            { label: 'Otros', value: 100 },
          ]);
        }
      }
      return GEO_FALLBACK;
    }
    const total = allocationGeography.reduce(
      (s, a) =>
        s + (typeof a.value === 'number' ? a.value : Number(a.value) || 0),
      0,
    );
    if (total <= 0) return GEO_FALLBACK;
    const raw: Omit<DonutSegment, 'color'>[] = allocationGeography.map((a) => {
      const val = typeof a.value === 'number' ? a.value : Number(a.value) || 0;
      const pct = Math.round((val / total) * 1000) / 10;
      return {
        label: String(a.region ?? '').trim() || 'Otros',
        value: pct,
      };
    });
    return segmentsWithBlueScale(raw);
  }, [allocationGeography, allocationStocks]);

  const stocksDonutSegmentsFromApi = React.useMemo(() => {
    if (!Array.isArray(allocationStocks) || allocationStocks.length === 0) {
      return STOCKS_SEGMENTS;
    }
    const totalStocksValue = allocationStocks.reduce(
      (s, a) =>
        s + (typeof a.value === 'number' ? a.value : Number(a.value) || 0),
      0,
    );
    if (totalStocksValue <= 0) return STOCKS_SEGMENTS;
    const raw: Omit<DonutSegment, 'color'>[] = allocationStocks.map((a) => {
      const val = typeof a.value === 'number' ? a.value : Number(a.value) || 0;
      const pct = Math.round((val / totalStocksValue) * 1000) / 10;
      return {
        label: String(a.symbol ?? a.name ?? '').trim() || '?',
        value: pct,
      };
    });
    return segmentsWithBlueScale(raw);
  }, [allocationStocks]);

  const donutSegments =
    activeChart === 'sector'
      ? sectorDonutSegmentsFromApi
      : activeChart === 'geo'
        ? geographyDonutSegmentsFromApi
        : stocksDonutSegmentsFromApi;

  return {
    portfolioSummary: stats.portfolioSummary,
    activeChart,
    setActiveChart,
    donutSegments,
    contextCards: stats.contextCards,
    statCards: stats.statCards,
    incomePeriods: stats.incomePeriods,
    selectedPeriod,
    setSelectedPeriod,
    incomeChartData: stats.incomeChartData,
    refetch,
    loadingSummary,
    summaryError,
  };
}
