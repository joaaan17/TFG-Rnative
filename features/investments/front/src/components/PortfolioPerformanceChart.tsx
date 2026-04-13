import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { LightweightChartView } from '@/features/market-chart';
import type { Candle } from '@/features/market-chart';
import { Text } from '@/shared/components/ui/text';
import { usePalette } from '@/shared/hooks/use-palette';
import { Hierarchy } from '@/design-system/typography';
import { usePortfolioAnalytics } from '../hooks/usePortfolioAnalytics';
import type { PerformanceRange } from '../api/investmentsClient';
import { AnimatedPillSelector } from '@/shared/components/ui/animated-pill-selector';
import { FINANCIAL_TERMS } from '../constants/financialTerms';
import { FinancialTooltipModal } from './FinancialTooltipModal';

const RANGE_OPTIONS: { value: PerformanceRange; label: string }[] = [
  { value: '1D', label: '1 D' },
  { value: '1W', label: '1 S' },
  { value: '1M', label: '1 M' },
  { value: '3M', label: '3 M' },
  { value: '6M', label: '6 M' },
  { value: '1Y', label: '1 A' },
];

const CHART_MODE_OPTIONS: { value: 'equity' | 'invested'; label: string }[] = [
  { value: 'invested', label: 'Invertido' },
  { value: 'equity', label: 'Valor cartera' },
];

/** Tipo mínimo de un punto de performance para interpolación */
type PerfPoint = {
  t: string;
  equity: number;
  cash: number;
  positions: number;
  invested: number;
};

function pointsToCandles(
  points: { t: string }[],
  getValue: (p: { t: string; [k: string]: unknown }) => number,
): Candle[] {
  return points.map((p) => {
    const time = Math.floor(new Date(p.t).getTime() / 1000);
    const v = getValue(p);
    return {
      time,
      open: v,
      high: v,
      low: v,
      close: v,
    };
  });
}

const ONE_HOUR_MS = 60 * 60 * 1000;

function hourStart(ms: number): number {
  return Math.floor(ms / ONE_HOUR_MS) * ONE_HOUR_MS;
}

/**
 * Si en 1D tenemos pocos puntos (p. ej. 2), generamos puntos horarios para las últimas 24 h
 * hasta la hora actual, para que el eje muestre 00:00, 01:00, … y termine en la hora de ahora.
 */
function expandToHourlyPoints(
  points: PerfPoint[],
  mode: 'equity' | 'invested',
): PerfPoint[] {
  if (points.length < 2) return points;
  if (points.length >= 25) return points;

  const first = new Date(points[0].t).getTime();
  const last = new Date(points[points.length - 1].t).getTime();
  const nowMs = Date.now();
  const endMs = hourStart(nowMs);
  const startMs = endMs - 24 * ONE_HOUR_MS;

  const v0 = mode === 'equity' ? points[0].equity : points[0].invested;
  const v1 =
    mode === 'equity'
      ? points[points.length - 1].equity
      : points[points.length - 1].invested;
  const rangeMs = Math.max(last - first, 1);

  const result: PerfPoint[] = [];
  for (let i = 0; i <= 24; i++) {
    const tMs = startMs + i * ONE_HOUR_MS;
    if (tMs > endMs) break;
    const frac = Math.min(1, Math.max(0, (tMs - first) / rangeMs));
    const value = v0 + (v1 - v0) * frac;
    const equity =
      mode === 'equity'
        ? value
        : points[0].equity +
          (points[points.length - 1].equity - points[0].equity) * frac;
    const invested =
      mode === 'invested'
        ? value
        : points[0].invested +
          (points[points.length - 1].invested - points[0].invested) * frac;
    result.push({
      t: new Date(tMs).toISOString(),
      equity: Math.round(equity * 100) / 100,
      invested: Math.round(invested * 100) / 100,
      cash: points[0].cash,
      positions: points[0].positions,
    });
  }
  return result.length >= 2 ? result : points;
}

/** Intervalo de refresco para que la línea del gráfico se actualice con el valor global (backend recalcula con precios actuales). */
const CHART_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export type PortfolioPerformanceChartProps = {
  token: string | null;
  height?: number;
};

export function PortfolioPerformanceChart({
  token,
  height = 280,
}: PortfolioPerformanceChartProps) {
  const palette = usePalette();
  const [range, setRange] = useState<PerformanceRange>('1M');
  const [mode, setMode] = useState<'equity' | 'invested'>('invested');
  const [tooltip, setTooltip] = useState<{ title: string; desc: string } | null>(null);
  const openTooltip = useCallback((label: string) => {
    const desc = FINANCIAL_TERMS[label];
    if (desc) setTooltip({ title: label, desc });
  }, []);

  const { performance, loading, error, fetchPerformance, refetch } =
    usePortfolioAnalytics(token, range);

  // Solo refetch al cambiar rango (o montaje): los puntos ya traen equity e invested;
  // cambiar "Valor cartera" / "Invertido" solo elige qué serie pintar, sin nueva petición.
  useEffect(() => {
    fetchPerformance();
  }, [range, fetchPerformance]);

  const refetchRef = useRef(refetch);
  const modeRef = useRef(mode);
  refetchRef.current = refetch;
  modeRef.current = mode;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!token) return;
    intervalRef.current = setInterval(() => {
      refetchRef.current(modeRef.current);
    }, CHART_REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [token]);

  const candles = useMemo((): Candle[] => {
    if (
      (mode === 'equity' || mode === 'invested') &&
      performance?.points?.length
    ) {
      const raw = performance.points as PerfPoint[];
      const points = range === '1D' ? expandToHourlyPoints(raw, mode) : raw;
      return pointsToCandles(
        points,
        mode === 'equity'
          ? (p) => (p as { equity: number }).equity
          : (p) => (p as { invested: number }).invested,
      );
    }
    return [];
  }, [mode, performance, range]);

  const isLoading = loading.equity;
  const errMsg = error.equity ?? null;

  if (!token) {
    return (
      <View
        style={{
          minHeight: height,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          variant="muted"
          style={[Hierarchy.bodySmall, { color: palette.icon }]}
        >
          Inicia sesión para ver la evolución de tu cartera
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 0 }}>
      <View style={{ paddingVertical: 8, marginBottom: 6 }}>
        <AnimatedPillSelector
          options={RANGE_OPTIONS}
          value={range}
          onChange={setRange}
          palette={palette}
          onLongPress={openTooltip}
        />
      </View>

      {/* Área del gráfico: altura fija; si hay datos y sigue cargando, overlay con spinner */}
      {isLoading && candles.length === 0 && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: height,
          }}
        >
          <ActivityIndicator size="large" color={palette.primary} />
          <Text
            variant="muted"
            style={[
              Hierarchy.bodySmall,
              { marginTop: 12, color: palette.icon },
            ]}
          >
            Cargando gráfico...
          </Text>
        </View>
      )}

      {errMsg && candles.length === 0 && !isLoading && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: height,
          }}
        >
          <Text
            variant="muted"
            style={[
              Hierarchy.bodySmall,
              { textAlign: 'center', color: palette.icon },
            ]}
          >
            {errMsg}
          </Text>
          <Pressable
            onPress={() => refetch(mode)}
            style={{
              marginTop: 16,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: palette.primary,
            }}
          >
            <Text
              style={[
                Hierarchy.action,
                { color: palette.primaryText ?? '#FFF' },
              ]}
            >
              Reintentar
            </Text>
          </Pressable>
        </View>
      )}

      {candles.length > 0 && (
        <View style={{ position: 'relative', minHeight: height }}>
          <LightweightChartView
            key={`perf-${mode}-${range}`}
            candles={candles}
            height={height}
            seriesType="line"
            intraday={range === '1D'}
            theme={{
              layoutBackgroundColor:
                palette.mainBackground ?? palette.background,
              textColor: palette.text,
              gridColor: palette.surfaceBorder ?? '#CBD5E1',
              upColor: palette.primary,
              fontSize: Hierarchy.captionSmall?.fontSize ?? 11,
            }}
          />
          {isLoading && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  height,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: palette.mainBackground ?? palette.background,
                    opacity: 0.72,
                  },
                ]}
              />
              <ActivityIndicator size="large" color={palette.primary} />
            </View>
          )}
        </View>
      )}

      <View style={{ paddingTop: 8 }}>
        <AnimatedPillSelector
          options={CHART_MODE_OPTIONS}
          value={mode}
          onChange={setMode}
          palette={palette}
          onLongPress={openTooltip}
        />
      </View>

      {!isLoading && candles.length === 0 && !errMsg && token && (
        <View
          style={{
            minHeight: height,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            variant="muted"
            style={[Hierarchy.bodySmall, { color: palette.icon }]}
          >
            No hay datos para este período
          </Text>
        </View>
      )}

      <FinancialTooltipModal
        visible={!!tooltip}
        title={tooltip?.title ?? ''}
        description={tooltip?.desc ?? ''}
        palette={palette}
        onClose={() => setTooltip(null)}
      />
    </View>
  );
}
