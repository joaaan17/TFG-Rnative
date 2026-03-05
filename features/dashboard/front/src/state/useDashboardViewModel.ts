import React from 'react';
import { useAuthSession } from '@/features/auth/front/src/state/AuthContext';
import { getPortfolioSummary } from '@/features/investments/front/src/api/investmentsClient';
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
 * Paleta azul del dashboard: de más oscuro a más claro.
 * Cuanto más peso (más acciones/%), más oscuro el azul; menos peso = más claro.
 */
const BLUE_PALETTE_DARK_TO_LIGHT = [
  '#0f172a', // blue-950 — más oscuro (mayor peso)
  '#1e3a5f', // blue-900
  '#1d4ed8', // primary
  '#2563eb', // blue-600
  '#3b82f6', // blue-500
  '#60a5fa', // blue-400
  '#93c5fd', // blue-300 — más claro (menor peso)
] as const;

/** Ordena segmentos por value descendente y asigna azules: mayor % = más oscuro. */
function segmentsWithBlueScale(segments: Omit<DonutSegment, 'color'>[]): DonutSegment[] {
  const sorted = [...segments].sort((a, b) => b.value - a.value);
  return sorted.map((seg, i) => ({
    ...seg,
    color: BLUE_PALETTE_DARK_TO_LIGHT[Math.min(i, BLUE_PALETTE_DARK_TO_LIGHT.length - 1)],
  }));
}

const SECTOR_SEGMENTS_RAW: Omit<DonutSegment, 'color'>[] = [
  { label: 'Tecnología', value: 35 },
  { label: 'Salud', value: 20 },
  { label: 'Cripto', value: 20 },
  { label: 'Consumo defensivo', value: 15 },
  { label: 'Energía', value: 10 },
];

const GEO_SEGMENTS_RAW: Omit<DonutSegment, 'color'>[] = [
  { label: 'EEUU', value: 60 },
  { label: 'Europa', value: 20 },
  { label: 'Asia', value: 10 },
  { label: 'Emergentes', value: 10 },
];

/** Distribución por acciones/activos (mock). */
const STOCKS_SEGMENTS_RAW: Omit<DonutSegment, 'color'>[] = [
  { label: 'Apple', value: 28 },
  { label: 'Nvidia', value: 25 },
  { label: 'Google', value: 22 },
  { label: 'Microsoft', value: 15 },
  { label: 'Intel', value: 10 },
];

const SECTOR_SEGMENTS: DonutSegment[] = segmentsWithBlueScale(SECTOR_SEGMENTS_RAW);
const GEO_SEGMENTS: DonutSegment[] = segmentsWithBlueScale(GEO_SEGMENTS_RAW);
const STOCKS_SEGMENTS: DonutSegment[] = segmentsWithBlueScale(STOCKS_SEGMENTS_RAW);

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

/** Cards de contexto (debajo del gráfico): 6 cards en 2 filas x 3. Mock. */
function getMockContextCards(): ContextCard[] {
  return [
    { id: 'best', label: 'Mejor activo', assetName: 'Nvidia', percent: '+42%' },
    { id: 'worst', label: 'Peor activo', assetName: 'Intel', percent: '-12%' },
    { id: 'assets', label: 'Activos en cartera', value: '5' },
    { id: 'operations', label: 'Operaciones', value: '12' },
    {
      id: 'lastOperation',
      label: 'Última operación',
      operationType: 'compra',
      assetName: 'Apple',
      quantity: '3 acciones',
      timeAgo: 'hace 2 días',
    },
    { id: 'volatility', label: 'Volatilidad', value: 'Media' },
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

  const [selectedPeriod, setSelectedPeriod] = React.useState<IncomePeriod>('semanal');
  const [activeChart, setActiveChart] = React.useState<'sector' | 'geo' | 'stocks'>('sector');

  const fetchSummary = React.useCallback(async () => {
    if (!token) {
      setLoadingSummary(false);
      setSummaryError(null);
      return;
    }
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const data = await getPortfolioSummary(token);
      setStats((prev) => ({
        ...prev,
        portfolioSummary: mapSummaryToPortfolioSummary(data.summary),
        contextCards: mapContextToContextCards(data.context),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el resumen';
      const isNetworkError =
        /fetch|network|failed to fetch|connection|econnrefused/i.test(message) || message === '';
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

  const donutSegments =
    activeChart === 'sector'
      ? SECTOR_SEGMENTS
      : activeChart === 'geo'
        ? GEO_SEGMENTS
        : STOCKS_SEGMENTS;

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
