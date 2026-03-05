/**
 * Barrel export de la feature dashboard.
 */

export { DashboardScreen } from './ui/DashboardScreen';
export { useDashboardViewModel } from './state/useDashboardViewModel';
export { StatCard } from './components/StatCard';
export { ContextCard } from './components/ContextCard';
export { IncomeLineChart } from './components/IncomeLineChart';
export { DonutChart } from './components/DonutChart';
export { PortfolioDonutChart } from './components/PortfolioDonutChart';
export type {
  DonutSegment,
  PortfolioDonutChartProps,
} from './types/portfolio-chart.types';
export type {
  ContextCardBestWorst,
  ContextCardMetric,
  DashboardStatCard,
  IncomePeriod,
  IncomeChartPoint,
  DashboardStats,
  PortfolioSummary,
} from './types/dashboard.types';
